import assert from "node:assert/strict";

import {
  QUOTATION_DISCOUNT_TYPES,
  QUOTATION_STATUS,
  QUOTATION_STATUSES,
} from "../src/features/quotations/constants/quotation.constants.js";
import {
  pickCancelQuotationPayload,
  pickCreateQuotationPayload,
  pickRejectQuotationPayload,
  pickUpdateQuotationPayload,
} from "../src/features/quotations/schemas/quotationPayloads.js";
import {
  calculateQuotationItemPreview,
  calculateQuotationTotalsPreview,
} from "../src/features/quotations/utils/quotationCalculator.js";
import { getQuotationCapabilities } from "../src/features/quotations/utils/quotationCapabilities.js";
import { formatQuotationItemDiscount, formatQuotationStatus } from "../src/features/quotations/utils/quotationFormatters.js";
import { cleanQuotationQuery } from "../src/features/quotations/utils/quotationQuery.js";

// --- constants -------------------------------------------------------

assert.deepEqual(QUOTATION_STATUSES, [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
  "CANCELLED",
]);
assert.deepEqual(QUOTATION_DISCOUNT_TYPES, ["PERCENTAGE", "FIXED"]);

// --- formatters --------------------------------------------------------

assert.equal(formatQuotationStatus("DRAFT"), "Draft");
assert.equal(formatQuotationStatus("SOME_FUTURE_BACKEND_STATUS"), "SOME_FUTURE_BACKEND_STATUS");
assert.equal(formatQuotationItemDiscount({ discountAmount: 0, discountType: null }), "-");
assert.equal(
  formatQuotationItemDiscount({ discountAmount: 20, discountType: "PERCENTAGE", discountValue: 10 }),
  "10% (- ₹20)",
);

// --- preview calculator (mirrors backend quotation.calculator.js) ------

const item1 = calculateQuotationItemPreview({
  discountType: "PERCENTAGE",
  discountValue: 10,
  quantity: 2,
  rate: 100,
  taxRate: 18,
});
assert.equal(item1.lineSubtotal, 200);
assert.equal(item1.discountAmount, 20);
assert.equal(item1.taxAmount, 32.4);
assert.equal(item1.lineTotal, 212.4);

const item2 = calculateQuotationItemPreview({ quantity: 1, rate: 50, taxRate: 5 });
assert.equal(item2.lineSubtotal, 50);
assert.equal(item2.discountAmount, 0);
assert.equal(item2.taxAmount, 2.5);
assert.equal(item2.lineTotal, 52.5);

const totals = calculateQuotationTotalsPreview({
  globalDiscount: { type: "FIXED", value: 10 },
  items: [
    { discountType: "PERCENTAGE", discountValue: 10, quantity: 2, rate: 100, taxRate: 18 },
    { quantity: 1, rate: 50, taxRate: 5 },
  ],
  otherCharges: 5,
  shippingCharge: 15,
});
assert.equal(totals.subtotal, 250);
assert.equal(totals.itemDiscountTotal, 20);
assert.equal(totals.taxTotal, 34.9);
assert.equal(totals.globalDiscount.amount, 10);
assert.equal(totals.shippingCharge, 15);
assert.equal(totals.otherCharges, 5);
assert.equal(totals.grandTotal, 274.9);

// A global discount larger than what remains must clamp to the running
// total, never drive grandTotal negative — same invariant the backend's
// own calculator test suite asserts.
const clamped = calculateQuotationTotalsPreview({
  globalDiscount: { type: "FIXED", value: 100000 },
  items: [{ quantity: 1, rate: 10, taxRate: 0 }],
});
assert.equal(clamped.grandTotal, 0);

// --- capability mapping (Prompt 46) -------------------------------------

const allow = () => true;
const deny = () => false;

const draftCaps = getQuotationCapabilities({ hasPermission: allow, quotation: { status: QUOTATION_STATUS.DRAFT } });
assert.equal(draftCaps.canEditQuotation, true);
assert.equal(draftCaps.canSendQuotation, true);
assert.equal(draftCaps.canCancelQuotation, true);
assert.equal(draftCaps.canAcceptQuotation, false);
assert.equal(draftCaps.canRejectQuotation, false);
assert.equal(draftCaps.canReviseQuotation, false);

const sentCaps = getQuotationCapabilities({ hasPermission: allow, quotation: { status: QUOTATION_STATUS.SENT } });
assert.equal(sentCaps.canEditQuotation, false);
assert.equal(sentCaps.canSendQuotation, false);
assert.equal(sentCaps.canAcceptQuotation, true);
assert.equal(sentCaps.canRejectQuotation, true);
assert.equal(sentCaps.canCancelQuotation, true);
assert.equal(sentCaps.canReviseQuotation, false);

const rejectedCaps = getQuotationCapabilities({
  hasPermission: allow,
  quotation: { status: QUOTATION_STATUS.REJECTED },
});
assert.equal(rejectedCaps.canReviseQuotation, true);
assert.equal(rejectedCaps.canEditQuotation, false);
assert.equal(rejectedCaps.canSendQuotation, false);
assert.equal(rejectedCaps.canAcceptQuotation, false);
assert.equal(rejectedCaps.canRejectQuotation, false);
assert.equal(rejectedCaps.canCancelQuotation, false);

const acceptedCaps = getQuotationCapabilities({
  hasPermission: allow,
  quotation: { status: QUOTATION_STATUS.ACCEPTED },
});
for (const key of [
  "canEditQuotation",
  "canSendQuotation",
  "canAcceptQuotation",
  "canRejectQuotation",
  "canCancelQuotation",
  "canReviseQuotation",
]) {
  assert.equal(acceptedCaps[key], false, `${key} must be false for a terminal ACCEPTED quotation.`);
}

// No permission => no capability regardless of status.
const noPermissionCaps = getQuotationCapabilities({ hasPermission: deny, quotation: { status: QUOTATION_STATUS.DRAFT } });
for (const key of Object.keys(noPermissionCaps)) {
  assert.equal(noPermissionCaps[key], false, `${key} must be false without the matching permission.`);
}

// --- payload whitelists (mass-assignment prevention, Prompt 40) --------

const createPayload = pickCreateQuotationPayload({
  acceptedAt: "2026-01-01",
  createdBy: "user-1",
  globalDiscount: { type: "PERCENTAGE", value: 5 },
  grandTotal: 999999,
  items: [{ description: "Bulk order", discountValue: "", product: { _id: "product-1" }, quantity: "2", rate: "150" }],
  leadId: "lead-1",
  otherCharges: "10",
  quotationNumber: "QUO999999",
  sentAt: "2026-01-02",
  shippingCharge: "25",
  status: "ACCEPTED",
  subtotal: 999999,
  validUntil: "2026-09-01",
});
assert.deepEqual(Object.keys(createPayload).sort(), [
  "globalDiscount",
  "items",
  "leadId",
  "otherCharges",
  "shippingCharge",
  "validUntil",
]);
assert.equal(createPayload.items[0].productId, "product-1");
assert.equal("discountType" in createPayload.items[0], false);

const updatePayload = pickUpdateQuotationPayload({
  createdBy: "user-1",
  grandTotal: 1,
  leadId: "lead-1",
  quotationNumber: "QUO000001",
  shippingCharge: "40",
  status: "SENT",
});
assert.deepEqual(Object.keys(updatePayload).sort(), ["shippingCharge"]);
assert.equal("leadId" in updatePayload, false, "Update payload must never include leadId — the backend schema has no such field.");

assert.deepEqual(pickRejectQuotationPayload("Pricing too high"), { reason: "Pricing too high" });
assert.deepEqual(pickRejectQuotationPayload({ reason: "  Budget cut  ", status: "REJECTED" }), {
  reason: "Budget cut",
});
assert.deepEqual(pickCancelQuotationPayload({ reason: "Duplicate", grandTotal: 0 }), { reason: "Duplicate" });

// --- query cleaning ------------------------------------------------------

assert.deepEqual(cleanQuotationQuery({ page: 1, search: "", status: "DRAFT" }), { page: 1, status: "DRAFT" });

console.log("Phase 5 unit checks passed.");
