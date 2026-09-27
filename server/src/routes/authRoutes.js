const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const auth = require('../controllers/authController');
const { upload } = require('../middleware/upload');

// Slow down brute-force attempts on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please try again later.' },
});

router.post('/register', authLimiter, upload.single('profileImage'), auth.register);
router.post('/login', authLimiter, auth.login);
router.post('/logout', auth.logout);
router.post('/forgot-password', otpLimiter, auth.forgotPassword);
router.post('/verify-otp', otpLimiter, auth.verifyOtp);
router.post('/reset-password', authLimiter, auth.resetPassword);

module.exports = router;
