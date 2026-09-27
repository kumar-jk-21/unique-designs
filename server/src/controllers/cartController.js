const prisma = require('../utils/prismaClient');
const { success, failure } = require('../utils/apiResponse');

function computeTotals(items) {
  let total = 0;
  const enriched = items.map((item) => {
    const subtotal = Number((item.product.finalPrice * item.quantity).toFixed(2));
    total += subtotal;
    return { ...item, subtotal };
  });
  return { items: enriched, total: Number(total.toFixed(2)) };
}

async function getCart(req, res, next) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: { include: { images: true } } } } },
    });

    const { items, total } = computeTotals(cart?.items || []);
    return success(res, 'Cart fetched successfully', { items, total });
  } catch (err) {
    next(err);
  }
}

async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    if (!productId) return failure(res, 'Product ID is required', 422);
    if (quantity <= 0) return failure(res, 'Quantity must be at least 1', 422);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return failure(res, 'Product not found', 404);
    if (product.status !== 'ACTIVE') return failure(res, 'This product is currently unavailable', 409);
    if (product.stock < quantity) {
      return failure(res, `Only ${product.stock} item(s) left in stock`, 409);
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, size: size || null, color: color || null },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (newQty > product.stock) {
        return failure(res, `Only ${product.stock} item(s) left in stock`, 409);
      }
      await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: newQty } });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: Number(quantity), size, color },
      });
    }

    return success(res, 'Product added to cart', {}, 201);
  } catch (err) {
    next(err);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return failure(res, 'Quantity must be at least 1', 422);

    const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { product: true, cart: true } });
    if (!item || item.cart.userId !== req.user.id) return failure(res, 'Cart item not found', 404);

    if (quantity > item.product.stock) {
      return failure(res, `Only ${item.product.stock} item(s) left in stock`, 409);
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return success(res, 'Cart updated successfully');
  } catch (err) {
    next(err);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item || item.cart.userId !== req.user.id) return failure(res, 'Cart item not found', 404);

    await prisma.cartItem.delete({ where: { id: itemId } });
    return success(res, 'Item removed from cart');
  } catch (err) {
    next(err);
  }
}

// Merges a guest (localStorage) cart into the DB cart after login.
// Expects: { items: [{ productId, quantity, size, color }] }
async function mergeGuestCart(req, res, next) {
  try {
    const { items = [] } = req.body;
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

    const skipped = [];

    for (const guestItem of items) {
      const product = await prisma.product.findUnique({ where: { id: guestItem.productId } });
      if (!product || product.status !== 'ACTIVE' || product.stock <= 0) {
        skipped.push(guestItem.productId);
        continue;
      }

      const quantity = Math.min(Number(guestItem.quantity) || 1, product.stock);
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: guestItem.productId,
          size: guestItem.size || null,
          color: guestItem.color || null,
        },
      });

      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: newQty } });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: guestItem.productId,
            quantity,
            size: guestItem.size,
            color: guestItem.color,
          },
        });
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
    const { items: enriched, total } = computeTotals(updatedCart.items);

    return success(res, 'Guest cart merged successfully', { items: enriched, total, skipped });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, mergeGuestCart };
