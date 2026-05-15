export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function validateCardNumber(num) {
  return num.replace(/\s+/g, '').length >= 13;
}

export function validateCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

export function validateExpiry(date) {
  if (!/^\d{2}\/\d{2}$/.test(date)) return false;
  const [month, year] = date.split('/').map(Number);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear() % 100;
  return month >= 1 && month <= 12 && (year > currentYear || (year === currentYear && month >= currentMonth));
}

export function validateRequired(value) {
  return value && value.trim().length > 0;
}