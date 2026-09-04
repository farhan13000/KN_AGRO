import { EMPLOYMENT_TYPE } from "../constants";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const today = new Date();

const hasValue = (value) => String(value || "").trim().length > 0;

const requireField = (errors, values, field, message) => {
  if (!hasValue(values[field])) {
    errors[field] = message;
  }
};

const validateEmail = (errors, values) => {
  if (!hasValue(values.email)) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
};

const validatePhone = (errors, values, required = true) => {
  if (!hasValue(values.phone)) {
    if (required) errors.phone = "Phone is required.";
    return;
  }

  const phone = String(values.phone).trim();
  if (phone.length < 6) {
    errors.phone = "Phone number is too short.";
  }
  if (phone.length > 20) {
    errors.phone = "Phone number must be 20 characters or fewer.";
  }
};

const validateEmploymentType = (errors, values) => {
  if (values.employmentType && !Object.values(EMPLOYMENT_TYPE).includes(values.employmentType)) {
    errors.employmentType = "Select a valid employment type.";
  }
};

const validateDate = (errors, values, field, label, required = false) => {
  if (!hasValue(values[field])) {
    if (required) errors[field] = `${label} is required.`;
    return;
  }

  const parsed = new Date(values[field]);
  if (Number.isNaN(parsed.getTime())) {
    errors[field] = `Enter a valid ${label.toLowerCase()}.`;
  } else if (parsed.getFullYear() < 1950 || parsed > today) {
    errors[field] = `Enter a reasonable ${label.toLowerCase()}.`;
  }
};

const result = (errors) => ({ errors, isValid: Object.keys(errors).length === 0 });

export const validateCreateEmployeeForm = (values = {}) => {
  const errors = {};

  requireField(errors, values, "name", "Name is required.");
  if (hasValue(values.name) && String(values.name).trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  validateEmail(errors, values);
  requireField(errors, values, "temporaryPassword", "Temporary password is required.");
  if (hasValue(values.temporaryPassword) && String(values.temporaryPassword).length < 8) {
    errors.temporaryPassword = "Temporary password must be at least 8 characters.";
  }
  validatePhone(errors, values);
  requireField(errors, values, "department", "Department is required.");
  requireField(errors, values, "designation", "Designation is required.");
  validateDate(errors, values, "dateOfJoining", "Date of Joining", true);
  validateEmploymentType(errors, values);

  return result(errors);
};

export const validateUpdateEmployeeForm = (values = {}) => {
  const errors = {};

  validatePhone(errors, values);
  requireField(errors, values, "department", "Department is required.");
  requireField(errors, values, "designation", "Designation is required.");
  validateDate(errors, values, "dateOfJoining", "Date of Joining");
  validateEmploymentType(errors, values);

  return result(errors);
};

export const validateSelfUpdateEmployeeForm = (values = {}) => {
  const errors = {};

  validatePhone(errors, values);
  return result(errors);
};

export const validateApprovalForm = (values = {}) => {
  const errors = {};

  validateDate(errors, values, "dateOfJoining", "Date of Joining");
  return result(errors);
};

export const validateRejectionForm = (values = {}) => {
  const errors = {};

  requireField(errors, values, "rejectionReason", "A rejection reason is required.");
  if (hasValue(values.rejectionReason) && String(values.rejectionReason).trim().length > 500) {
    errors.rejectionReason = "Rejection reason must be 500 characters or fewer.";
  }

  return result(errors);
};
