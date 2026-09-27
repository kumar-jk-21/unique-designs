const fs = require('fs');
const path = require('path');
const prisma = require('../utils/prismaClient');
const { success, failure } = require('../utils/apiResponse');
const { calculateDiscount } = require('../utils/discount');
const { validateProduct } = require('../validators/productValidators');
const { UPLOAD_DIR } = require('../middleware/upload');

function parseArrayField(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall back to comma-separated string
      return value.split(',').map((v) => v.trim()).filter(Boolean);
    }
  }
  return [];
}

// GET /api/products — public catalog with search, filter, sort, pagination
async function listProducts(req, res, next) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minDiscount,
      size,
      color,
      inStock,
      sort,
      page = 1,
      limit = 12,
      status,
    } = req.query;

    const where = {};
    const isAdminRequest = req.user && req.user.role !== 'USER';

    // Public catalog only ever shows ACTIVE products.
    // Admins may pass a specific status, or omit it to see every status.
    if (!isAdminRequest) {
      where.status = 'ACTIVE';
    } else if (status && ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { OR: [{ slug: category }, { id: category }] };
    }
    if (minPrice || maxPrice) {
      where.finalPrice = {};
      if (minPrice) where.finalPrice.gte = Number(minPrice);
      if (maxPrice) where.finalPrice.lte = Number(maxPrice);
    }
    if (minDiscount) {
      where.discountAmount = { gte: Number(minDiscount) };
    }
    if (size) {
      where.sizes = { has: size };
    }
    if (color) {
      where.colors = { has: color };
    }
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { finalPrice: 'asc' };
    else if (sort === 'price_desc') orderBy = { finalPrice: 'desc' };
    else if (sort === 'discount') orderBy = { discountAmount: 'desc' };
    else if (sort === 'popular') orderBy = { rating: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const take = Math.min(Number(limit) || 12, 100);
    const skip = (Math.max(Number(page), 1) - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { images: true, category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return success(res, 'Products fetched successfully', {
      products,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { createdAt: 'asc' } }, category: true },
    });
    if (!product) return failure(res, 'Product not found', 404);
    return success(res, 'Product fetched successfully', { product });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { valid, errors } = validateProduct(req.body);
    if (!valid) return failure(res, 'Please fix the errors in the form', 422, errors);

    const { name, categoryId, description, price, discountType, discountValue, stock, rating, status } =
      req.body;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || !category.isActive) {
      return failure(res, 'Selected category is invalid or inactive', 422);
    }

    let discountResult;
    try {
      discountResult = calculateDiscount(price, discountType || 'NONE', discountValue || 0);
    } catch (e) {
      return failure(res, e.message, 422);
    }

    const files = req.files || [];
    const stockNum = Number(stock);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        categoryId,
        description,
        price: Number(price),
        discountType: discountType || 'NONE',
        discountValue: discountResult.discountValue,
        discountAmount: discountResult.discountAmount,
        finalPrice: discountResult.finalPrice,
        stock: stockNum,
        rating: rating ? Number(rating) : 0,
        sizes: parseArrayField(req.body.sizes),
        colors: parseArrayField(req.body.colors),
        status: stockNum === 0 ? 'OUT_OF_STOCK' : status || 'ACTIVE',
        images: {
          create: files.map((f) => ({ imageUrl: `/uploads/${f.filename}` })),
        },
      },
      include: { images: true, category: true },
    });

    return success(res, 'Product added successfully', { product }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return failure(res, 'Product not found', 404);

    const { valid, errors } = validateProduct(req.body, { isUpdate: true });
    if (!valid) return failure(res, 'Please fix the errors in the form', 422, errors);

    const { name, categoryId, description, price, discountType, discountValue, stock, rating, status } =
      req.body;

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || !category.isActive) {
        return failure(res, 'Selected category is invalid or inactive', 422);
      }
    }

    const newPrice = price !== undefined ? Number(price) : existing.price;
    const newDiscountType = discountType !== undefined ? discountType : existing.discountType;
    const newDiscountValue = discountValue !== undefined ? Number(discountValue) : existing.discountValue;

    let discountResult;
    try {
      discountResult = calculateDiscount(newPrice, newDiscountType, newDiscountValue);
    } catch (e) {
      return failure(res, e.message, 422);
    }

    const files = req.files || [];
    const newStock = stock !== undefined ? Number(stock) : existing.stock;
    let newStatus = status !== undefined ? status : existing.status;
    if (newStock === 0) newStatus = 'OUT_OF_STOCK';
    else if (newStatus === 'OUT_OF_STOCK' && newStock > 0) newStatus = 'ACTIVE';

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(categoryId !== undefined && { categoryId }),
        ...(description !== undefined && { description }),
        price: newPrice,
        discountType: newDiscountType,
        discountValue: discountResult.discountValue,
        discountAmount: discountResult.discountAmount,
        finalPrice: discountResult.finalPrice,
        stock: newStock,
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(req.body.sizes !== undefined && { sizes: parseArrayField(req.body.sizes) }),
        ...(req.body.colors !== undefined && { colors: parseArrayField(req.body.colors) }),
        status: newStatus,
        ...(files.length > 0 && {
          images: { create: files.map((f) => ({ imageUrl: `/uploads/${f.filename}` })) },
        }),
      },
      include: { images: true, category: true },
    });

    return success(res, 'Product updated successfully', { product });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!product) return failure(res, 'Product not found', 404);

    await prisma.product.delete({ where: { id } });

    // Best-effort cleanup of image files from disk
    for (const img of product.images) {
      const filePath = path.join(UPLOAD_DIR, path.basename(img.imageUrl));
      fs.unlink(filePath, () => {});
    }

    return success(res, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
}

async function deleteProductImage(req, res, next) {
  try {
    const { id, imageId } = req.params;
    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
    if (!image) return failure(res, 'Image not found', 404);

    await prisma.productImage.delete({ where: { id: imageId } });

    const filePath = path.join(UPLOAD_DIR, path.basename(image.imageUrl));
    fs.unlink(filePath, () => {});

    return success(res, 'Image deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
};
