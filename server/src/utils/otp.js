const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  // Cryptographically secure 6-digit numeric OTP, zero-padded.
  const max = 10 ** OTP_LENGTH;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(OTP_LENGTH, '0');
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function verifyOtpHash(otp, hash) {
  return bcrypt.compare(otp, hash);
}

function getExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  getExpiryDate,
  OTP_EXPIRY_MINUTES,
  MAX_ATTEMPTS,
};
