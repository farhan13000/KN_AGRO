import { CUSTOMER_TYPES } from "../constants/customer.constants.js";

const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

const trimOrUndefined = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
};

const numberOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
};

const idOf = (value) => (typeof value === "string" ? value : value?._id || value?.id || "");

// Matches the backend's exact address subdocument shape
// (customer.model.js) — six fields, no `_id`.
const pickAddress = (address) => {
  if (!address || typeof address !== "object") return undefined;
  const picked = cleanPayload({
    line1: trimOrUndefined(address.line1),
    line2: trimOrUndefined(address.line2),
    city: trimOrUndefined(address.city),
    state: trimOrUndefined(address.state),
    postalCode: trimOrUndefined(address.postalCode),
    country: trimOrUndefined(address.country),
  });
  return Object.keys(picked).length ? picked : undefined;
};

// Shared by create and update — matches the backend's editable-field
// whitelist. Server-owned fields (customerCode, status, blockReason,
// createdBy, updatedBy, timestamps) are simply never referenced here.
const pickCustomerEditableFields = (values) =>
  cleanPayload({
    name: trimOrUndefined(values.name),
    companyName: trimOrUndefined(values.companyName),
    type: CUSTOMER_TYPES.includes(values.type) ? values.type : undefined,
    email: trimOrUndefined(values.email),
    phone: trimOrUndefined(values.phone),
    billingAddress: pickAddress(values.billingAddress),
    shippingAddress: pickAddress(values.shippingAddress),
    GSTNumber: trimOrUndefined(values.GSTNumber),
    PANNumber: trimOrUndefined(values.PANNumber),
    location: trimOrUndefined(values.location),
    creditLimit: numberOrUndefined(values.creditLimit),
    paymentTerms: trimOrUndefined(values.paymentTerms),
  });

export const pickCreateCustomerPayload = (values) =>
  cleanPayload({
    ...pickCustomerEditableFields(values),
    // sourceLead is create-only and immutable afterward (backend update
    // schema rejects it entirely) — never included in the update payload.
    sourceLead: trimOrUndefined(idOf(values.sourceLead)),
  });

export const pickUpdateCustomerPayload = (values) => pickCustomerEditableFields(values);

export const pickChangeCustomerStatusPayload = (values) =>
  cleanPayload({
    status: trimOrUndefined(typeof values === "string" ? values : values?.status),
    reason: trimOrUndefined(typeof values === "string" ? undefined : values?.reason),
  });

const emptyAddress = { line1: "", line2: "", city: "", state: "", postalCode: "", country: "" };

export const initialCustomerFormValues = {
  name: "",
  companyName: "",
  type: "INDIVIDUAL",
  phone: "",
  email: "",
  billingAddress: { ...emptyAddress },
  shippingAddress: { ...emptyAddress },
  GSTNumber: "",
  PANNumber: "",
  location: "",
  creditLimit: "",
  paymentTerms: "",
};

// Prompt 22 (Edit): populates the form from a live Customer record. Only
// ever reads editable fields — customerCode/status/blockReason/sourceLead/
// createdBy/updatedBy are never surfaced here, matching the backend update
// schema's own exclusions.
export const customerToFormValues = (customer) => ({
  name: customer?.name || "",
  companyName: customer?.companyName || "",
  type: customer?.type || "INDIVIDUAL",
  phone: customer?.phone || "",
  email: customer?.email || "",
  billingAddress: { ...emptyAddress, ...(customer?.billingAddress || {}) },
  shippingAddress: { ...emptyAddress, ...(customer?.shippingAddress || {}) },
  GSTNumber: customer?.GSTNumber || "",
  PANNumber: customer?.PANNumber || "",
  location: customer?.location || "",
  creditLimit: customer?.creditLimit != null ? String(customer.creditLimit) : "",
  paymentTerms: customer?.paymentTerms || "",
});

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// Client-side mirror of customer.validation.js's createCustomerSchema —
// same rules, just surfaced early so the user isn't round-tripping to the
// backend to learn "name too short" or "phone or email required".
export const validateCustomerForm = (values) => {
  const errors = {};
  const name = String(values.name || "").trim();
  if (name.length < 2 || name.length > 150) {
    errors.name = "Name must be between 2 and 150 characters.";
  }
  if (values.companyName && values.companyName.trim().length > 150) {
    errors.companyName = "Company name must be 150 characters or fewer.";
  }
  const phone = String(values.phone || "").trim();
  const email = String(values.email || "").trim();
  if (!phone && !email) {
    errors.phone = "Either phone or email is required.";
  }
  if (phone && (phone.length < 6 || phone.length > 20)) {
    errors.phone = "Phone must be between 6 and 20 characters.";
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.GSTNumber && !GST_REGEX.test(values.GSTNumber.trim().toUpperCase())) {
    errors.GSTNumber = "Invalid GSTIN format.";
  }
  if (values.PANNumber && !PAN_REGEX.test(values.PANNumber.trim().toUpperCase())) {
    errors.PANNumber = "Invalid PAN format.";
  }
  if (values.creditLimit !== "" && values.creditLimit != null) {
    const creditLimit = Number(values.creditLimit);
    if (!Number.isFinite(creditLimit) || creditLimit < 0) {
      errors.creditLimit = "Credit limit must be 0 or greater.";
    }
  }
  if (values.paymentTerms && values.paymentTerms.trim().length > 100) {
    errors.paymentTerms = "Payment terms must be 100 characters or fewer.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};
