import { PAYMENT_METHODS } from "../constants/payment.constants.js";

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

// Matches recordPaymentSchema exactly — deliberately no paidAmount/
// dueAmount/paymentStatus field: those are always server-derived from the
// invoice's own totals, never sent by the client (see payment.validation.js
// module doc comment on the backend).
export const pickRecordPaymentPayload = (values = {}) =>
  cleanPayload({
    amount: numberOrUndefined(values.amount),
    method: PAYMENT_METHODS.includes(values.method) ? values.method : undefined,
    transactionReference: trimOrUndefined(values.transactionReference),
    paymentDate: trimOrUndefined(values.paymentDate),
    notes: trimOrUndefined(values.notes),
  });

export const initialRecordPaymentFormValues = {
  amount: "",
  method: "CASH",
  transactionReference: "",
  paymentDate: "",
  notes: "",
};

// Client-side mirror of payment.validation.js's recordPaymentSchema.
// `dueAmount` is Prompt 47's soft, UX-only pre-check — "amount <=
// dueAmount" is surfaced as a warning message, never a hard block (the
// return value's `warning` field, distinct from `errors`, is intentionally
// non-blocking) — the backend's own atomic check is the real authority,
// and the caller must never silently clamp/rewrite the entered amount.
export const validateRecordPaymentForm = (values, { dueAmount } = {}) => {
  const errors = {};
  const amount = Number(values.amount);

  if (!values.amount || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be greater than 0.";
  }
  if (!PAYMENT_METHODS.includes(values.method)) {
    errors.method = "Select a valid payment method.";
  }
  if (values.transactionReference && values.transactionReference.trim().length > 200) {
    errors.transactionReference = "Reference must be 200 characters or fewer.";
  }
  if (values.notes && values.notes.trim().length > 1000) {
    errors.notes = "Notes must be 1000 characters or fewer.";
  }

  let warning = "";
  if (!errors.amount && Number.isFinite(dueAmount) && amount > dueAmount) {
    warning = `This exceeds the currently displayed due amount (${dueAmount}) — the backend will reject an actual overpayment.`;
  }

  return { errors, isValid: Object.keys(errors).length === 0, warning };
};
