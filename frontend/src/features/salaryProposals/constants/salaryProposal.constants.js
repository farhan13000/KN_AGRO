// Mirrors BACKEND/backend/src/modules/salaryProposals/salaryProposal.constants.js.
export const SALARY_PROPOSAL_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  RECOMMENDED: "RECOMMENDED",
  REVIEWED: "REVIEWED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  FINALIZED: "FINALIZED",
});

export const SALARY_PROPOSAL_STATUS_LABELS = Object.freeze({
  [SALARY_PROPOSAL_STATUS.DRAFT]: "Draft",
  [SALARY_PROPOSAL_STATUS.RECOMMENDED]: "Awaiting Review",
  [SALARY_PROPOSAL_STATUS.REVIEWED]: "Awaiting Approval",
  [SALARY_PROPOSAL_STATUS.APPROVED]: "Approved",
  [SALARY_PROPOSAL_STATUS.REJECTED]: "Rejected",
  [SALARY_PROPOSAL_STATUS.FINALIZED]: "Finalized",
});

/**
 * Which role owns each stage transition, mirroring
 * SalaryProposalService's own checks (same shape/purpose as Hiring's own
 * HIRING_STAGE_ROLES/HIRING_REJECT_STAGE_ROLES). Used ONLY to decide
 * whether to render a button — the backend remains the authority and its
 * 403 is surfaced if the two disagree.
 */
export const SALARY_PROPOSAL_STAGE_ROLES = Object.freeze({
  REVIEW: ["gm"],
  APPROVE: ["sa"],
  FINALIZE: ["sa"],
});

// Reject is only possible while a stage owner exists for the current
// status (see the backend's STAGE_OWNER_ROLE map) — GM at RECOMMENDED,
// SA at REVIEWED.
export const SALARY_PROPOSAL_REJECT_STAGE_ROLES = Object.freeze({
  [SALARY_PROPOSAL_STATUS.RECOMMENDED]: "gm",
  [SALARY_PROPOSAL_STATUS.REVIEWED]: "sa",
});
