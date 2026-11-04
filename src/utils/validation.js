// Centralized Validation Helper for all Real Estate CRM Forms

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  // Standard RFC 5322 compatible email regex
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Clean special characters (+, -, space, brackets)
  const digitsOnly = String(phone).replace(/[^0-9]/g, '');
  // Indian phone numbers: exactly 10 digits or 12 digits (with 91 country code)
  return digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('91'));
};

export const cleanDigits = (val) => {
  if (!val) return '';
  return String(val).replace(/[^0-9]/g, '');
};

export const isValidPinCode = (pin) => {
  if (!pin) return false;
  const digits = String(pin).replace(/[^0-9]/g, '');
  return digits.length === 6;
};

