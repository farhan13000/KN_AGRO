export const isValidEmail = (value) => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isValidPhone = (value) => {
  if (!value) return false;
  return /^[6-9]\d{9}$|^\+?[1-9]\d{9,14}$/.test(value.replace(/\s+/g, ""));
};

export const validateRequired = (value) => String(value || "").trim().length > 0;

export const validateMinLength = (value, minLength) =>
  String(value || "").trim().length >= minLength;
