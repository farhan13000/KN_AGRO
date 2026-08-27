import assert from "node:assert/strict";

import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from "../src/features/customers/constants/customer.constants.js";
import {
  pickChangeCustomerStatusPayload,
  pickCreateCustomerPayload,
  pickUpdateCustomerPayload,
  validateCustomerForm,
} from "../src/features/customers/schemas/customerPayloads.js";
import { getCustomerCapabilities } from "../src/features/customers/utils/customerCapabilities.js";
import { formatCustomerStatus, formatCustomerType } from "../src/features/customers/utils/customerFormatters.js";
import { cleanCustomerQuery } from "../src/features/customers/utils/customerQuery.js";

import { INVOICE_ELIGIBLE_ORDER_STATUSES, ORDER_STATUSES } from "../src/features/orders/constants/order.constants.js";
import { pickCancelOrderPayload, pickCreateOrderFromQuotationPayload } from "../src/features/orders/schemas/orderPayloads.js";
import { getOrderCapabilities } from "../src/features/orders/utils/orderCapabilities.js";
import { formatOrderStatus } from "../src/features/orders/utils/orderFormatters.js";
import { cleanOrderQuery } from "../src/features/orders/utils/orderQuery.js";

import { INVOICE_PAYMENT_STATUSES, INVOICE_STATUSES } from "../src/features/invoices/constants/invoice.constants.js";
import {
  pickCancelInvoicePayload,
  pickGenerateInvoicePayload,
  pickIssueInvoicePayload,
} from "../src/features/invoices/schemas/invoicePayloads.js";
import { getInvoiceCapabilities } from "../src/features/invoices/utils/invoiceCapabilities.js";
import { formatInvoicePaymentStatus, formatInvoiceStatus } from "../src/features/invoices/utils/invoiceFormatters.js";
import { cleanInvoiceQuery } from "../src/features/invoices/utils/invoiceQuery.js";

import { PAYMENT_METHODS } from "../src/features/payments/constants/payment.constants.js";
import { pickRecordPaymentPayload, validateRecordPaymentForm } from "../src/features/payments/schemas/paymentPayloads.js";
import { formatPaymentMethod } from "../src/features/payments/utils/paymentFormatters.js";
import { cleanPaymentQuery } from "../src/features/payments/utils/paymentQuery.js";

import { getBusinessDaysOverdue } from "../src/shared/utils/dateTime.js";
import { getQuotationCapabilities } from "../src/features/quotations/utils/quotationCapabilities.js";

const allow = () => true;
const deny = () => false;

// --- constants -----------------------------------------------------------

assert.deepEqual(CUSTOMER_STATUSES, ["ACTIVE", "INACTIVE", "BLOCKED"]);
assert.deepEqual(CUSTOMER_TYPES, ["INDIVIDUAL", "BUSINESS"]);
assert.deepEqual(ORDER_STATUSES, [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
]);
assert.deepEqual(INVOICE_ELIGIBLE_ORDER_STATUSES, ["CONFIRMED", "PROCESSING", "READY", "DISPATCHED", "DELIVERED"]);
assert.deepEqual(INVOICE_STATUSES, ["DRAFT", "ISSUED", "CANCELLED"]);
assert.deepEqual(INVOICE_PAYMENT_STATUSES, ["UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"]);
assert.deepEqual(PAYMENT_METHODS, ["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "CARD", "OTHER"]);

// --- formatters (Prompt 82: Order/Invoice/Payment status+method badges) --

assert.equal(formatCustomerStatus("ACTIVE"), "Active");
assert.equal(formatCustomerStatus("SOME_FUTURE_STATUS"), "SOME_FUTURE_STATUS", "Unknown status must fail safely, never throw.");
assert.equal(formatCustomerType("BUSINESS"), "Business");

assert.equal(formatOrderStatus("DISPATCHED"), "Dispatched");
assert.equal(formatOrderStatus("DRAFT"), "DRAFT", "DRAFT is unreachable dead code — falls back to the raw value, never throws.");
assert.equal(formatOrderStatus(undefined), "Unknown");

assert.equal(formatInvoiceStatus("ISSUED"), "Issued");
assert.equal(formatInvoiceStatus("BOGUS"), "BOGUS");

assert.equal(formatInvoicePaymentStatus("OVERDUE"), "Overdue");
assert.equal(formatInvoicePaymentStatus("PARTIALLY_PAID"), "Partially Paid");
assert.equal(formatInvoicePaymentStatus(null), "Unknown");

assert.equal(formatPaymentMethod("UPI"), "UPI");
assert.equal(formatPaymentMethod("BANK_TRANSFER"), "Bank Transfer");
assert.equal(formatPaymentMethod("SOME_NEW_METHOD"), "SOME_NEW_METHOD");

// --- getBusinessDaysOverdue (Prompt 52/74) --------------------------------

assert.equal(getBusinessDaysOverdue(null), null);
assert.equal(getBusinessDaysOverdue(undefined), null);
// A due date in the far past against a fixed "now" must report a stable,
// positive day count — never negative, never NaN.
const overdueDays = getBusinessDaysOverdue("2024-01-01T00:00:00.000Z", new Date("2024-01-11T12:00:00.000Z"));
assert.equal(overdueDays, 10);
// A due date that is today or in the future must never report overdue days.
assert.equal(getBusinessDaysOverdue("2024-01-11T00:00:00.000Z", new Date("2024-01-11T08:00:00.000Z")), 0);
assert.equal(getBusinessDaysOverdue("2024-01-15T00:00:00.000Z", new Date("2024-01-11T08:00:00.000Z")), 0);

// --- getOrderCapabilities: full transition matrix (Prompt 27/62) ---------

for (const status of ORDER_STATUSES) {
  const caps = getOrderCapabilities({ hasPermission: deny, order: { orderStatus: status } });
  for (const key of Object.keys(caps)) {
    assert.equal(caps[key], false, `${key} must be false without the matching permission (status=${status}).`);
  }
}

const pendingCaps = getOrderCapabilities({ hasPermission: allow, order: { orderStatus: "PENDING" } });
assert.equal(pendingCaps.canConfirmOrder, true);
assert.equal(pendingCaps.canCancelOrder, true);
assert.equal(pendingCaps.canMarkProcessing, false);
assert.equal(pendingCaps.canGenerateInvoice, false, "PENDING is never invoice-eligible.");

const confirmedCaps = getOrderCapabilities({ hasPermission: allow, order: { orderStatus: "CONFIRMED" } });
assert.equal(confirmedCaps.canConfirmOrder, false, "Already-confirmed order cannot be confirmed again.");
assert.equal(confirmedCaps.canMarkProcessing, true);
assert.equal(confirmedCaps.canCancelOrder, true);
assert.equal(confirmedCaps.canGenerateInvoice, true, "CONFIRMED is invoice-eligible.");

const dispatchedCaps = getOrderCapabilities({ hasPermission: allow, order: { orderStatus: "DISPATCHED" } });
assert.equal(dispatchedCaps.canCancelOrder, false, "Cannot cancel once dispatched.");
assert.equal(dispatchedCaps.canMarkDelivered, true);
assert.equal(dispatchedCaps.canGenerateInvoice, true);

for (const status of ["DELIVERED", "CANCELLED"]) {
  const caps = getOrderCapabilities({ hasPermission: allow, order: { orderStatus: status } });
  assert.equal(caps.canCancelOrder, false, `${status} is terminal for cancellation.`);
  assert.equal(caps.canConfirmOrder, false);
  assert.equal(caps.canMarkProcessing, false);
  assert.equal(caps.canMarkReady, false);
  assert.equal(caps.canDispatchOrder, false);
  assert.equal(caps.canMarkDelivered, false);
}

// --- getInvoiceCapabilities: status/paidAmount/role-gated cancel ---------

const draftInvoice = { status: "DRAFT", paymentSummary: { dueAmount: 1000, paidAmount: 0 } };
assert.equal(getInvoiceCapabilities({ hasPermission: allow, invoice: draftInvoice, role: "sales_manager" }).canCancelInvoice, true, "DRAFT cancel needs only the permission.");
assert.equal(getInvoiceCapabilities({ hasPermission: allow, invoice: draftInvoice, role: "sales_manager" }).canIssueInvoice, true);
assert.equal(getInvoiceCapabilities({ hasPermission: allow, invoice: draftInvoice, role: "sales_manager" }).canRecordPayment, false, "DRAFT invoices are never payable.");

const issuedUnpaid = { status: "ISSUED", paymentSummary: { dueAmount: 1000, paidAmount: 0 } };
assert.equal(getInvoiceCapabilities({ hasPermission: allow, invoice: issuedUnpaid, role: "sales_manager" }).canCancelInvoice, false, "Sales Manager can never cancel an ISSUED invoice, even at zero payments.");
assert.equal(getInvoiceCapabilities({ hasPermission: allow, invoice: issuedUnpaid, role: "super_admin" }).canCancelInvoice, true, "Super Admin can cancel an ISSUED invoice with zero payments.");
assert.equal(getInvoiceCapabilities({ hasPermission: allow, invoice: issuedUnpaid, role: "sales_manager" }).canRecordPayment, true);

const issuedPaid = { status: "ISSUED", paymentSummary: { dueAmount: 400, paidAmount: 600 } };
assert.equal(getInvoiceCapabilities({ hasPermission: allow, invoice: issuedPaid, role: "super_admin" }).canCancelInvoice, false, "Any payment recorded blocks cancellation unconditionally, even for Super Admin.");

const issuedFullyPaid = { status: "ISSUED", paymentSummary: { dueAmount: 0, paidAmount: 1000 } };
assert.equal(getInvoiceCapabilities({ hasPermission: allow, invoice: issuedFullyPaid, role: "super_admin" }).canRecordPayment, false, "Zero due amount must never offer Record Payment.");

for (const invoice of [draftInvoice, issuedUnpaid, issuedPaid]) {
  const caps = getInvoiceCapabilities({ hasPermission: deny, invoice, role: "super_admin" });
  assert.equal(caps.canIssueInvoice, false);
  assert.equal(caps.canCancelInvoice, false);
  assert.equal(caps.canRecordPayment, false);
}

// --- getCustomerCapabilities (Prompt 62 fix) ------------------------------

const customerCapsAllowed = getCustomerCapabilities({ hasPermission: allow });
assert.equal(customerCapsAllowed.canCreateCustomer, true);
assert.equal(customerCapsAllowed.canEditCustomer, true);
const customerCapsDenied = getCustomerCapabilities({ hasPermission: deny });
assert.equal(customerCapsDenied.canCreateCustomer, false);
assert.equal(customerCapsDenied.canEditCustomer, false);

// --- getQuotationCapabilities: canCreateOrderFromQuotation (Prompt 23) ---

assert.equal(
  getQuotationCapabilities({ hasPermission: allow, quotation: { status: "ACCEPTED" } }).canCreateOrderFromQuotation,
  true,
);
assert.equal(
  getQuotationCapabilities({ hasPermission: allow, quotation: { status: "CONVERTED" } }).canCreateOrderFromQuotation,
  false,
  "Once converted, Create Order must never show again.",
);
assert.equal(
  getQuotationCapabilities({ hasPermission: deny, quotation: { status: "ACCEPTED" } }).canCreateOrderFromQuotation,
  false,
);

// --- validateCustomerForm (Prompt 21/82 "Customer forms") ----------------

const shortNameResult = validateCustomerForm({ name: "A", phone: "9876543210" });
assert.equal(shortNameResult.isValid, false);
assert.ok(shortNameResult.errors.name);

const noContactResult = validateCustomerForm({ name: "Valid Name" });
assert.equal(noContactResult.isValid, false);
assert.ok(noContactResult.errors.phone, "Either phone or email is required.");

const badGstResult = validateCustomerForm({ name: "Valid Name", phone: "9876543210", GSTNumber: "not-a-gstin" });
assert.equal(badGstResult.isValid, false);
assert.ok(badGstResult.errors.GSTNumber);

const validResult = validateCustomerForm({ name: "Valid Name", phone: "9876543210", creditLimit: "5000" });
assert.equal(validResult.isValid, true);
assert.deepEqual(validResult.errors, {});

// --- validateRecordPaymentForm + overpayment UX (Prompt 45/47/82) --------

const zeroAmount = validateRecordPaymentForm({ amount: "0", method: "CASH" }, { dueAmount: 1000 });
assert.equal(zeroAmount.isValid, false);
assert.ok(zeroAmount.errors.amount);

const badMethod = validateRecordPaymentForm({ amount: "100", method: "BITCOIN" }, { dueAmount: 1000 });
assert.equal(badMethod.isValid, false);
assert.ok(badMethod.errors.method);

// Overpayment is a soft, non-blocking warning — never a hard error, and
// never something that mutates/clamps the entered amount.
const overpay = validateRecordPaymentForm({ amount: "1500", method: "CASH" }, { dueAmount: 1000 });
assert.equal(overpay.isValid, true, "Overpayment must not block submission client-side — the backend is authoritative.");
assert.ok(overpay.warning, "Overpayment must surface a warning message.");
assert.equal(Object.keys(overpay.errors).length, 0);

const exactPay = validateRecordPaymentForm({ amount: "1000", method: "CASH" }, { dueAmount: 1000 });
assert.equal(exactPay.isValid, true);
assert.equal(exactPay.warning, "", "Paying exactly the due amount must not warn.");

// --- payload whitelists: mass assignment prevention (Prompt 64/82) -------

const poisonedCustomer = pickCreateCustomerPayload({
  name: "Acme Farms",
  phone: "9876543210",
  customerCode: "CUS999999",
  status: "BLOCKED",
  blockReason: "hacked in",
  createdBy: "user-1",
  updatedBy: "user-1",
  creditLimit: "10000",
});
assert.equal("customerCode" in poisonedCustomer, false);
assert.equal("status" in poisonedCustomer, false);
assert.equal("blockReason" in poisonedCustomer, false);
assert.equal("createdBy" in poisonedCustomer, false);
assert.equal("updatedBy" in poisonedCustomer, false);
assert.equal(poisonedCustomer.creditLimit, 10000);

const poisonedCustomerUpdate = pickUpdateCustomerPayload({ name: "New Name", sourceLead: "lead-999" });
assert.equal("sourceLead" in poisonedCustomerUpdate, false, "sourceLead is create-only/immutable — update must never send it.");

assert.deepEqual(pickChangeCustomerStatusPayload({ status: "BLOCKED", reason: "Non-payment", customerCode: "CUS1" }), {
  status: "BLOCKED",
  reason: "Non-payment",
});

const poisonedOrder = pickCreateOrderFromQuotationPayload({
  expectedDeliveryDate: "2026-01-01",
  notes: "Handle with care",
  items: [{ product: "p1" }],
  customer: "cust-1",
  grandTotal: 999999,
  orderStatus: "DELIVERED",
});
assert.deepEqual(Object.keys(poisonedOrder).sort(), ["expectedDeliveryDate", "notes"]);

const poisonedCancelOrder = pickCancelOrderPayload({ reason: "Customer changed mind", orderStatus: "CANCELLED" });
assert.deepEqual(poisonedCancelOrder, { reason: "Customer changed mind" });

const poisonedGenerateInvoice = pickGenerateInvoicePayload({
  dueDate: "2026-02-01",
  items: [{ product: "p1" }],
  grandTotal: 999999,
  invoiceNumber: "INV999999",
});
assert.deepEqual(Object.keys(poisonedGenerateInvoice), ["dueDate"]);

const poisonedIssueInvoice = pickIssueInvoicePayload({
  invoiceDate: "2026-01-01",
  dueDate: "2026-01-15",
  paidAmount: 999999,
  paymentStatus: "PAID",
});
assert.deepEqual(Object.keys(poisonedIssueInvoice).sort(), ["dueDate", "invoiceDate"]);

const poisonedCancelInvoice = pickCancelInvoicePayload({ reason: "Duplicate", paidAmount: 0 });
assert.deepEqual(poisonedCancelInvoice, { reason: "Duplicate" });

const poisonedPayment = pickRecordPaymentPayload({
  amount: "500",
  method: "UPI",
  transactionReference: "UTR123",
  paymentDate: "2026-01-05",
  notes: "Advance",
  paymentNumber: "PAY999999",
  recordedBy: "user-1",
  recordedByEmployee: "emp-1",
  paidAmount: 999999,
  dueAmount: 0,
  paymentStatus: "PAID",
});
assert.deepEqual(Object.keys(poisonedPayment).sort(), ["amount", "method", "notes", "paymentDate", "transactionReference"]);
assert.equal(poisonedPayment.amount, 500);

// --- query cleaners --------------------------------------------------------

assert.deepEqual(cleanCustomerQuery({ page: 1, search: "", status: "ACTIVE" }), { page: 1, status: "ACTIVE" });
assert.deepEqual(cleanOrderQuery({ page: 1, orderStatus: "", sortBy: "createdAt" }), { page: 1, sortBy: "createdAt" });
assert.deepEqual(cleanInvoiceQuery({ page: 1, paymentStatus: "", status: "DRAFT" }), { page: 1, status: "DRAFT" });
assert.deepEqual(cleanPaymentQuery({ page: 1, method: "", search: "PAY0001" }), { page: 1, search: "PAY0001" });

console.log("Phase 6 unit checks passed.");
