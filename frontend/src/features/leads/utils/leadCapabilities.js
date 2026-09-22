import { PERMISSIONS } from "../../../shared/constants/permissions.constants.js";
import { MANAGER_TIER_ROLES, normalizeRoleName } from "../../../shared/constants";
import { LEAD_STATUS } from "../constants/lead.constants.js";

const terminalStatuses = [LEAD_STATUS.CONVERTED, LEAD_STATUS.LOST, LEAD_STATUS.CLOSED];

// Before anyone has decided the lead is worth quoting.
const EARLY_STATUSES = [LEAD_STATUS.NEW, LEAD_STATUS.CONTACTED, LEAD_STATUS.FOLLOW_UP];

export const getLeadCapabilities = ({ hasPermission, lead, role }) => {
  const canUpdateLead = hasPermission(PERMISSIONS.LEADS_UPDATE);
  const canAssign = hasPermission(PERMISSIONS.LEADS_ASSIGN);
  const canChangeStatus = hasPermission(PERMISSIONS.LEADS_CHANGE_STATUS);
  const canScheduleFollowUp = hasPermission(PERMISSIONS.LEADS_FOLLOW_UP);

  return {
    canViewLead: hasPermission(PERMISSIONS.LEADS_READ),
    canCreateLead: hasPermission(PERMISSIONS.LEADS_CREATE),
    canEditLead: canUpdateLead,
    // ORG-HIERARCHY MIGRATION (Phase F09) — was hardcoded to
    // role === SUPER_ADMIN / [SUPER_ADMIN, SALES_MANAGER], silently
    // hiding both buttons from every new-hierarchy role (SA/OA/GM/RM/ASM)
    // even though they hold LEADS_ASSIGN — a real regression this phase's
    // own grep was meant to catch. The backend route for both
    // (PATCH /leads/:id/manager and /employee) is gated by the SAME
    // single LEADS_ASSIGN permission with no further role split, so a
    // role check here duplicated (and drifted from) a rule the backend
    // already enforces — matches this file's own convention (every other
    // capability below is permission-only, no role branching).
    // WHICH manager owns a lead is an OA/SA decision, so the button is
    // hidden from every manager tier (GM/RM/ASM/SO). They still hold
    // LEADS_ASSIGN — that is what canAssignEmployee below rides on, so
    // delegating to their own direct report is unaffected. The backend
    // already refuses a manager-tier actor naming anyone but themselves
    // here (see lead.service.js's assignManager); this stops the UI from
    // offering an action that was only ever a self-claim in disguise.
    canAssignManager: canAssign && !MANAGER_TIER_ROLES.includes(normalizeRoleName(role)),
    canAssignEmployee: canAssign,
    canChangeStatus,
    canChangePriority: canUpdateLead,
    canUpdateExpectedValue: canUpdateLead,
    canUpdateProductInterest: canUpdateLead,
    canScheduleFollowUp,
    // Only when there is actually one to complete. The permission alone
    // put a "Complete Follow-Up" button on every lead, including ones
    // whose own panel said "Next follow-up: Not Set" three inches away.
    canCompleteFollowUp: canScheduleFollowUp && Boolean(lead?.nextFollowUpAt),
    canAddActivity: hasPermission(PERMISSIONS.LEADS_ACTIVITIES_CREATE),
    // "Nobody has spoken to them yet" is the one state where advancing
    // the lead needs no judgement and no form — so it gets a single
    // press of its own rather than sending someone into the generic
    // stage picker to find the one row that applies.
    canLogFirstContact: canChangeStatus && lead?.status === LEAD_STATUS.NEW,
    canMarkLost:
      canChangeStatus &&
      ![LEAD_STATUS.CONVERTED, LEAD_STATUS.LOST, LEAD_STATUS.CLOSED].includes(lead?.status),
    canCloseLead: canChangeStatus && [LEAD_STATUS.CONVERTED, LEAD_STATUS.LOST].includes(lead?.status),
    // Qualifying is a step forward out of the early conversation, so it
    // is offered only while the lead is still in it. Past QUALIFIED it
    // was a button that moved the lead BACKWARDS — a quotation had gone
    // out and the panel still invited someone to re-qualify. Correcting
    // a wrongly advanced lead is still possible, through "Change stage",
    // which is where going backwards belongs.
    canQualify: canChangeStatus && EARLY_STATUSES.includes(lead?.status),
    // Backend only accepts creating a quotation against a QUALIFIED lead
    // (see PHASE5_FRONTEND_API_CONTRACT.md) and re-validates this itself —
    // this only decides whether the button is worth showing. It does not
    // pre-check "does this lead already have an active quotation", since
    // no endpoint for that is wired into this feature yet; the backend's
    // 409 on a duplicate active quotation is the real guard.
    canCreateQuotation: hasPermission(PERMISSIONS.QUOTATIONS_CREATE) && lead?.status === LEAD_STATUS.QUALIFIED,
    // The other half of the same moment: whoever CANNOT price a
    // quotation asks the manager who can. Keyed on the same permission
    // as above so the two can never both be true, or both be false, for
    // a qualified lead.
    canRequestQuotation:
      !hasPermission(PERMISSIONS.QUOTATIONS_CREATE) && lead?.status === LEAD_STATUS.QUALIFIED,
  };
};
