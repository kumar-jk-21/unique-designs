const prisma = require('../utils/prismaClient');
const { success, failure } = require('../utils/apiResponse');

async function getWishlist(req, res, next) {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: { include: { images: true } } } } },
    });

    const items = wishlist?.items || [];
    const totalValue = items.reduce((sum, item) => sum + (item.product?.finalPrice || 0), 0);

    return success(res, 'Wishlist fetched successfully', {
      items,
      totalValue: Number(totalValue.toFixed(2)),
    });
  } catch (err) {
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) return failure(res, 'Product ID is required', 422);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return failure(res, 'Product not found', 404);

    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: req.user.id } });
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    if (existingItem) return failure(res, 'Product is already in your wishlist', 409);

    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });

    return success(res, 'Product added to wishlist', {}, 201);
  } catch (err) {
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });
    if (!wishlist) return failure(res, 'Wishlist not found', 404);

    const item = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    if (!item) return failure(res, 'Product not found in wishlist', 404);

    await prisma.wishlistItem.delete({ where: { id: item.id } });
    return success(res, 'Product removed from wishlist');
  } catch (err) {
    next(err);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
