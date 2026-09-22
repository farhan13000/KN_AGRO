import { EMPLOYMENT_TYPE } from "../constants";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

/**
 * A joining date, with no window around it.
 *
 * It used to refuse anything after today, which quietly broke the
 * commonest case there is: an offer accepted now for someone who starts
 * next month. Approving a hiring request has the same shape — the
 * joining date is agreed before the person arrives, so it is almost
 * always in the future at the moment it is typed in.
 *
 * A floor of 1950 went with it, and was equally arbitrary: entering a
 * long-serving employee into the system for the first time is an
 * ordinary thing, and no year the business might legitimately use
 * belongs in a validator's opinion.
 *
 * So: past, today or future, as long as it is a real date. The backend
 * never had a bound here either (employee.validation.js and
 * hiring.validation.js both take a plain date), so this now agrees with
 * it rather than being a stricter rule invented on one side.
 */
const validateJoiningDate = (errors, values, field, label, required = false) => {
  if (!hasValue(values[field])) {
    if (required) errors[field] = `${label} is required.`;
    return;
  }

  if (Number.isNaN(new Date(values[field]).getTime())) {
    errors[field] = `Enter a valid ${label.toLowerCase()}.`;
  }
};

const result = (errors) => ({ errors, isValid: Object.keys(errors).length === 0 });

// Where the person works. Only the state is required — districts and
// post offices narrow it down when the business knows them.
const validateCoverage = (errors, values) => {
  const coverage = values.coverage || {};
  if (!(coverage.states || []).length) {
    errors.coverageStates = "Pick at least one state this employee covers.";
  }
};

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
  validateJoiningDate(errors, values, "dateOfJoining", "Date of Joining", true);
  validateEmploymentType(errors, values);
  validateCoverage(errors, values);

  return result(errors);
};

export const validateUpdateEmployeeForm = (values = {}) => {
  const errors = {};

  validateCoverage(errors, values);
  validatePhone(errors, values);
  requireField(errors, values, "department", "Department is required.");
  requireField(errors, values, "designation", "Designation is required.");
  validateJoiningDate(errors, values, "dateOfJoining", "Date of Joining");
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

  validateJoiningDate(errors, values, "dateOfJoining", "Date of Joining");
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
