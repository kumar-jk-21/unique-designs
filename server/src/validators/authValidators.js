const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/; // 10-digit Indian mobile format
const PINCODE_REGEX = /^\d{6}$/;
// At least 8 chars, one uppercase, one lowercase, one number, one special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validateRegistration(body) {
  const errors = {};
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
    confirmPassword,
  } = body;

  if (!fullName || !fullName.trim()) errors.fullName = 'Full name is required';
  if (!mobileNumber || !MOBILE_REGEX.test(mobileNumber)) {
    errors.mobileNumber = 'Enter a valid 10-digit mobile number';
  }
  if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
    errors.dateOfBirth = 'Enter a valid date of birth';
  }
  if (!email || !EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address';
  if (!address || !address.trim()) errors.address = 'Address is required';
  if (!pincode || !PINCODE_REGEX.test(pincode)) errors.pincode = 'Enter a valid 6-digit pincode';
  if (!doorNumber || !doorNumber.trim()) errors.doorNumber = 'Door number is required';
  if (!streetName || !streetName.trim()) errors.streetName = 'Street name is required';
  if (!district || !district.trim()) errors.district = 'District is required';
  if (!state || !state.trim()) errors.state = 'State is required';
  if (!password || !PASSWORD_REGEX.test(password)) {
    errors.password =
      'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character';
  }
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateLogin(body) {
  const errors = {};
  const { emailOrMobile, password } = body;
  if (!emailOrMobile || !emailOrMobile.trim()) {
    errors.emailOrMobile = 'Email or mobile number is required';
  }
  if (!password) errors.password = 'Password is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

function validatePasswordReset(body) {
  const errors = {};
  const { newPassword, confirmPassword } = body;
  if (!newPassword || !PASSWORD_REGEX.test(newPassword)) {
    errors.newPassword =
      'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character';
  }
  if (confirmPassword !== newPassword) errors.confirmPassword = 'Passwords do not match';
  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = {
  EMAIL_REGEX,
  MOBILE_REGEX,
  PINCODE_REGEX,
  PASSWORD_REGEX,
  validateRegistration,
  validateLogin,
  validatePasswordReset,
};
