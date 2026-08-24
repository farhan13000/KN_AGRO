import assert from "node:assert/strict";

import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_STATUS,
} from "../src/features/leads/constants/lead.constants.js";
import {
  pickPublicEnquiryPayload,
  pickStatusPayload,
  pickUpdateLeadPayload,
} from "../src/features/leads/schemas/leadPayloads.js";
import { getCrmErrorMessage, shouldRefetchAfterCrmError } from "../src/features/leads/utils/crmErrors.js";
import { formatLeadPriority, formatLeadSource, formatLeadStatus } from "../src/features/leads/utils/leadFormatters.js";
import { LEAD_ACTIVITY_TYPE, MANUAL_ACTIVITY_TYPES } from "../src/features/lead-activities/constants/leadActivity.constants.js";
import { pickManualActivityPayload } from "../src/features/lead-activities/schemas/leadActivityPayloads.js";
import { getFollowUpPresentationState } from "../src/shared/utils/dateTime.js";

assert.deepEqual(LEAD_STATUSES, [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "QUOTATION_SENT",
  "NEGOTIATION",
  "CONVERTED",
  "LOST",
  "CLOSED",
]);
assert.deepEqual(LEAD_PRIORITIES, ["LOW", "MEDIUM", "HIGH", "URGENT"]);
assert.deepEqual(LEAD_SOURCES, ["WEBSITE", "PHONE", "WHATSAPP", "REFERRAL", "WALK_IN", "MANUAL", "OTHER"]);

assert.equal(formatLeadStatus("QUALIFIED"), "Qualified");
assert.equal(formatLeadStatus("BACKEND_NEW_VALUE"), "BACKEND_NEW_VALUE");
assert.equal(formatLeadPriority("URGENT"), "Urgent");
assert.equal(formatLeadSource("WEBSITE"), "Website");

const publicPayload = pickPublicEnquiryPayload({
  name: "Visitor",
  companyName: "Farm Co",
  phone: "9999999999",
  email: "visitor@example.com",
  location: "Pune",
  interestedProducts: [{ _id: "product-1" }],
  message: "Need details",
  assignedManager: "manager-1",
  assignedEmployee: "employee-1",
  status: "CONVERTED",
  priority: "URGENT",
  expectedValue: 9999,
  leadCode: "LEAD-1",
  lostReason: "No",
  convertedAt: "2026-01-01",
  closedAt: "2026-01-02",
});
assert.deepEqual(Object.keys(publicPayload).sort(), [
  "companyName",
  "email",
  "interestedProducts",
  "location",
  "message",
  "name",
  "phone",
]);

const updatePayload = pickUpdateLeadPayload({
  name: "Updated",
  companyName: "Farm Co",
  phone: "9999999999",
  email: "updated@example.com",
  location: "Nashik",
  message: "Plain details",
  assignedManager: "manager-1",
  assignedEmployee: "employee-1",
  status: "LOST",
  priority: "URGENT",
  leadCode: "LEAD-2",
  lostReason: "Bad fit",
  convertedAt: "2026-01-01",
  closedAt: "2026-01-02",
  createdBy: "user-1",
  updatedBy: "user-2",
});
assert.deepEqual(Object.keys(updatePayload).sort(), ["companyName", "email", "location", "message", "name", "phone"]);

assert.deepEqual(pickStatusPayload({ status: "BOGUS", reason: "Bad" }), { reason: "Bad" });
assert.deepEqual(pickStatusPayload({ status: LEAD_STATUS.LOST, reason: "Budget mismatch" }), {
  reason: "Budget mismatch",
  status: LEAD_STATUS.LOST,
});

for (const systemType of [
  LEAD_ACTIVITY_TYPE.LEAD_CREATED,
  LEAD_ACTIVITY_TYPE.ASSIGNED_MANAGER,
  LEAD_ACTIVITY_TYPE.STATUS_CHANGED,
  LEAD_ACTIVITY_TYPE.CONVERTED,
]) {
  assert.equal(MANUAL_ACTIVITY_TYPES.includes(systemType), false, `${systemType} must not be manually creatable.`);
}
assert.equal(MANUAL_ACTIVITY_TYPES.includes(LEAD_ACTIVITY_TYPE.CALL), true);
assert.deepEqual(pickManualActivityPayload({ type: LEAD_ACTIVITY_TYPE.STATUS_CHANGED, title: "Fake" }), {
  title: "Fake",
});

assert.equal(getCrmErrorMessage({ status: 409 }), "This lead changed while you were working. The latest lead data has been reloaded.");
assert.equal(shouldRefetchAfterCrmError({ status: 409 }), true);
assert.equal(shouldRefetchAfterCrmError({ status: 429 }), false);

assert.equal(getFollowUpPresentationState("").label, "No follow-up");
assert.equal(
  getFollowUpPresentationState("2026-08-24T03:00:00.000Z", new Date("2026-08-24T08:00:00.000Z")).label,
  "Due today",
);
assert.equal(
  getFollowUpPresentationState("2026-08-23T03:00:00.000Z", new Date("2026-08-24T08:00:00.000Z")).label,
  "Overdue",
);
assert.equal(
  getFollowUpPresentationState("2026-08-25T03:00:00.000Z", new Date("2026-08-24T08:00:00.000Z")).label,
  "Upcoming",
);

console.log("Phase 4 unit checks passed.");
