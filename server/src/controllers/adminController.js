const bcrypt = require('bcryptjs');
const prisma = require('../utils/prismaClient');
const { success, failure } = require('../utils/apiResponse');
const { sanitizeUser } = require('./authController');
const { validateRegistration } = require('../validators/authValidators');

async function getDashboard(req, res, next) {
  try {
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalAdmins,
      totalWishlistItems,
      lowStockProducts,
      activeProducts,
      inactiveProducts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.wishlistItem.count(),
      prisma.product.count({ where: { stock: { lte: 5, gt: 0 } } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'INACTIVE' } }),
    ]);

    return success(res, 'Dashboard stats fetched successfully', {
      totalUsers,
      totalProducts,
      totalCategories,
      totalAdmins,
      totalWishlistItems,
      lowStockProducts,
      activeProducts,
      inactiveProducts,
    });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const where = { role: 'USER' };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const take = Math.min(Number(limit), 100);
    const skip = (Math.max(Number(page), 1) - 1) * take;

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.user.count({ where }),
    ]);

    return success(res, 'Users fetched successfully', {
      users: users.map(sanitizeUser),
      pagination: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) || 1 },
    });
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') return failure(res, 'isActive must be true or false', 422);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'USER') return failure(res, 'User not found', 404);

    const updated = await prisma.user.update({ where: { id }, data: { isActive } });
    return success(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, {
      user: sanitizeUser(updated),
    });
  } catch (err) {
    next(err);
  }
}

async function listAdmins(req, res, next) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, 'Admins fetched successfully', { admins: admins.map(sanitizeUser) });
  } catch (err) {
    next(err);
  }
}

// Only SUPER_ADMIN can call this (enforced by route middleware)
async function createAdmin(req, res, next) {
  try {
    const { valid, errors } = validateRegistration({
      ...req.body,
      // admins don't need the full address form; relax those checks
      address: req.body.address || 'N/A',
      pincode: req.body.pincode || '000000',
      doorNumber: req.body.doorNumber || 'N/A',
      streetName: req.body.streetName || 'N/A',
      district: req.body.district || 'N/A',
      state: req.body.state || 'N/A',
      dateOfBirth: req.body.dateOfBirth || '2000-01-01',
    });
    if (!valid) return failure(res, 'Please fix the errors in the form', 422, errors);

    const { fullName, email, mobileNumber, password } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { mobileNumber }] },
    });
    if (existing) return failure(res, 'An account with this email or mobile number already exists', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase(),
        mobileNumber,
        dateOfBirth: new Date('2000-01-01'),
        passwordHash,
        role: 'ADMIN', // Super Admin role can never be granted through this endpoint
        profileImage: req.file ? `/uploads/${req.file.filename}` : null,
      },
    });

    return success(res, 'Admin created successfully', { admin: sanitizeUser(admin) }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateAdminStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') return failure(res, 'isActive must be true or false', 422);

    const admin = await prisma.user.findUnique({ where: { id } });
    if (!admin || admin.role === 'USER') return failure(res, 'Admin not found', 404);
    if (admin.role === 'SUPER_ADMIN') return failure(res, 'Super Admin status cannot be changed', 403);
    if (admin.id === req.user.id) return failure(res, 'You cannot deactivate your own account', 400);

    const updated = await prisma.user.update({ where: { id }, data: { isActive } });
    return success(res, `Admin ${isActive ? 'activated' : 'deactivated'} successfully`, {
      admin: sanitizeUser(updated),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  listUsers,
  updateUserStatus,
  listAdmins,
  createAdmin,
  updateAdminStatus,
};
