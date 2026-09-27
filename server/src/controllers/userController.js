const bcrypt = require('bcryptjs');
const prisma = require('../utils/prismaClient');
const { success, failure } = require('../utils/apiResponse');
const { sanitizeUser } = require('./authController');
const { PASSWORD_REGEX, PINCODE_REGEX, MOBILE_REGEX } = require('../validators/authValidators');

async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return failure(res, 'User not found', 404);
    return success(res, 'Profile fetched successfully', { user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const {
      fullName,
      mobileNumber,
      dateOfBirth,
      address,
      pincode,
      doorNumber,
      streetName,
      district,
      state,
    } = req.body;

    const errors = {};
    if (mobileNumber && !MOBILE_REGEX.test(mobileNumber)) {
      errors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (pincode && !PINCODE_REGEX.test(pincode)) {
      errors.pincode = 'Enter a valid 6-digit pincode';
    }
    if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
      errors.dateOfBirth = 'Enter a valid date of birth';
    }
    if (Object.keys(errors).length) return failure(res, 'Please fix the errors in the form', 422, errors);

    if (mobileNumber) {
      const conflict = await prisma.user.findFirst({
        where: { mobileNumber, NOT: { id: req.user.id } },
      });
      if (conflict) return failure(res, 'This mobile number is already in use', 409);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(mobileNumber && { mobileNumber }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(address !== undefined && { address }),
        ...(pincode !== undefined && { pincode }),
        ...(doorNumber !== undefined && { doorNumber }),
        ...(streetName !== undefined && { streetName }),
        ...(district !== undefined && { district }),
        ...(state !== undefined && { state }),
      },
    });

    return success(res, 'Profile updated successfully', { user: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

async function updateProfileImage(req, res, next) {
  try {
    if (!req.file) return failure(res, 'Please select an image to upload', 422);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: `/uploads/${req.file.filename}` },
    });

    return success(res, 'Profile image updated successfully', { user: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const errors = {};

    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword || !PASSWORD_REGEX.test(newPassword)) {
      errors.newPassword =
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character';
    }
    if (confirmPassword !== newPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length) return failure(res, 'Please fix the errors in the form', 422, errors);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) return failure(res, 'Current password is incorrect', 401);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    return success(res, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, updateProfileImage, changePassword };
