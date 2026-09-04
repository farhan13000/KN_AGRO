export const DISTRICT_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
});

export const DISTRICT_STATUS_LABELS = Object.freeze({
  [DISTRICT_STATUS.ACTIVE]: "Active",
  [DISTRICT_STATUS.INACTIVE]: "Inactive",
});

// Mirrors BACKEND/backend/src/modules/districts/district.constants.js exactly.
// null means no assignment request is currently pending.
export const DISTRICT_ASSIGNMENT_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  ACTIVE: "ACTIVE",
});

export const DISTRICT_ASSIGNMENT_STATUS_LABELS = Object.freeze({
  [DISTRICT_ASSIGNMENT_STATUS.DRAFT]: "Draft",
  [DISTRICT_ASSIGNMENT_STATUS.PENDING_APPROVAL]: "Pending Review",
  [DISTRICT_ASSIGNMENT_STATUS.APPROVED]: "Approved — Awaiting Finalization",
  [DISTRICT_ASSIGNMENT_STATUS.ACTIVE]: "Active",
});

export const DEFAULT_DISTRICT_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  status: "",
  region: "",
});

// Mirrors BACKEND/backend/src/core/authorization + district.service.js's
// role checks for reviewAssignment (GM/OA) and finalizeAssignment (SA) —
// permission (DISTRICT_ASSIGN) alone can't distinguish "may propose" from
// "may review" from "may finalize" since all three share one permission
// at the route layer; the backend narrows by role name inside the
// service, so this UI mirrors that split to avoid showing an action a
// click would just 403 on. Keep in sync by hand if district.service.js's
// checks ever change.
export const DISTRICT_REVIEW_ROLES = Object.freeze(["gm", "oa"]);
export const DISTRICT_FINALIZE_ROLES = Object.freeze(["sa"]);
