const bcrypt = require('bcryptjs');
const prisma = require('../utils/prismaClient');
const { success, failure } = require('../utils/apiResponse');
const { signToken } = require('../utils/jwt');
const {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  EMAIL_REGEX,
} = require('../validators/authValidators');
const { generateOtp, hashOtp, verifyOtpHash, getExpiryDate, MAX_ATTEMPTS } = require('../utils/otp');
const { sendOtpEmail } = require('../services/emailService');

const SALT_ROUNDS = 12;

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

async function register(req, res, next) {
  try {
    const { valid, errors } = validateRegistration(req.body);
    if (!valid) return failure(res, 'Please fix the errors in the form', 422, errors);

    const {
      fullName,
      mobileNumber,
      dateOfBirth,
      email,
      address,
      pincode,
      doorNumber,
      streetName,
      district,
      state,
      password,
    } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { mobileNumber }] },
    });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'email' : 'mobile number';
      return failure(res, `An account with this ${field} already exists`, 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        mobileNumber,
        dateOfBirth: new Date(dateOfBirth),
        email: email.toLowerCase(),
        profileImage: req.file ? `/uploads/${req.file.filename}` : null,
        address,
        pincode,
        doorNumber,
        streetName,
        district,
        state,
        passwordHash,
      },
    });

    // Every user gets an empty wishlist + cart on creation
    await prisma.wishlist.create({ data: { userId: user.id } });
    await prisma.cart.create({ data: { userId: user.id } });

    const token = signToken({ id: user.id, role: user.role });

    return success(res, 'Account created successfully', { user: sanitizeUser(user), token }, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { valid, errors } = validateLogin(req.body);
    if (!valid) return failure(res, 'Please fix the errors in the form', 422, errors);

    const { emailOrMobile, password } = req.body;
    const isEmail = EMAIL_REGEX.test(emailOrMobile);

    const user = await prisma.user.findFirst({
      where: isEmail ? { email: emailOrMobile.toLowerCase() } : { mobileNumber: emailOrMobile },
    });

    if (!user) return failure(res, 'Invalid email/mobile or password', 401);
    if (!user.isActive) return failure(res, 'Your account has been deactivated. Contact support.', 403);

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return failure(res, 'Invalid email/mobile or password', 401);

    const token = signToken({ id: user.id, role: user.role });

    return success(res, 'Login successful', { user: sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  // JWT is stateless; logout is handled client-side by discarding the token.
  return success(res, 'Logged out successfully');
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email)) {
      return failure(res, 'Enter a valid registered email address', 422);
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always respond the same way whether or not the account exists,
    // to avoid leaking which emails are registered.
    if (user) {
      const otp = generateOtp();
      const otpHash = await hashOtp(otp);

      await prisma.passwordResetOTP.create({
        data: {
          userId: user.id,
          otpHash,
          expiresAt: getExpiryDate(),
        },
      });

      try {
        await sendOtpEmail(user.email, otp);
      } catch (mailErr) {
        console.error('Failed to send OTP email:', mailErr.message);
        return failure(res, 'Unable to send OTP right now. Please try again later.', 502);
      }
    }

    return success(res, 'If this email is registered, an OTP has been sent to it.');
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return failure(res, 'Email and OTP are required', 422);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return failure(res, 'Invalid OTP or email', 400);

    const record = await prisma.passwordResetOTP.findFirst({
      where: { userId: user.id, isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return failure(res, 'No active OTP request found. Please request a new OTP.', 400);
    if (record.expiresAt < new Date()) return failure(res, 'OTP has expired. Please request a new one.', 400);
    if (record.attemptCount >= MAX_ATTEMPTS) {
      return failure(res, 'Too many incorrect attempts. Please request a new OTP.', 429);
    }

    const isMatch = await verifyOtpHash(otp, record.otpHash);
    if (!isMatch) {
      await prisma.passwordResetOTP.update({
        where: { id: record.id },
        data: { attemptCount: { increment: 1 } },
      });
      return failure(res, 'Incorrect OTP', 400);
    }

    // Mark verified via a short-lived reset token (not the OTP itself)
    const resetToken = signToken({ id: user.id, purpose: 'password_reset', otpId: record.id });

    return success(res, 'OTP verified successfully', { resetToken });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { resetToken } = req.body;
    const { valid, errors } = validatePasswordReset(req.body);
    if (!valid) return failure(res, 'Please fix the errors in the form', 422, errors);
    if (!resetToken) return failure(res, 'Reset session is invalid. Please verify OTP again.', 400);

    let decoded;
    try {
      decoded = require('../utils/jwt').verifyToken(resetToken);
    } catch {
      return failure(res, 'Reset session has expired. Please verify OTP again.', 400);
    }
    if (decoded.purpose !== 'password_reset') {
      return failure(res, 'Invalid reset session', 400);
    }

    const record = await prisma.passwordResetOTP.findUnique({ where: { id: decoded.otpId } });
    if (!record || record.isUsed) {
      return failure(res, 'This reset link has already been used. Please start again.', 400);
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({ where: { id: decoded.id }, data: { passwordHash } }),
      prisma.passwordResetOTP.update({ where: { id: record.id }, data: { isUsed: true } }),
    ]);

    return success(res, 'Password reset successfully. Please log in with your new password.');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, forgotPassword, verifyOtp, resetPassword, sanitizeUser };
