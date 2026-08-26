import { PERMISSIONS } from "../../../shared/constants/permissions.constants.js";
import { QUOTATION_STATUS } from "../constants/quotation.constants.js";

// The complete Prompt 46 capability set. `quotation` is optional — the
// record-independent capabilities (list/view/create/print) only need a
// permission check, while the lifecycle ones also need the record's
// current status, exactly mirroring the backend's own transition matrix
// (never a stricter or looser rule invented on this side).
//
// `canCreateQuotation` here is deliberately just the raw permission check
// (record-independent — "can this user create quotations at all", used by
// the list page's Create button). It is distinct from
// `features/leads/utils/leadCapabilities.js#getLeadCapabilities`'s own
// `canCreateQuotation`, which additionally requires a specific Lead to be
// QUALIFIED — same name, different question, by design (one is global, one
// is per-Lead-status).
//
// canReviseQuotation is deliberately narrower than phase5.md's own
// illustrative Prompt 35 example (which lists SENT/ACCEPTED as revisable
// too) — the real backend only allows revise from REJECTED or EXPIRED
// (quotation.service.js#reviseQuotation), and "do not hardcode
// undocumented transitions" means following the actual contract, not the
// prompt's generic example.
export const getQuotationCapabilities = ({ hasPermission, quotation }) => {
  const status = quotation?.status;

  return {
    canListQuotation: hasPermission(PERMISSIONS.QUOTATIONS_READ),
    canViewQuotation: hasPermission(PERMISSIONS.QUOTATIONS_READ),
    canPrintQuotation: hasPermission(PERMISSIONS.QUOTATIONS_READ),
    canCreateQuotation: hasPermission(PERMISSIONS.QUOTATIONS_CREATE),
    canEditQuotation: hasPermission(PERMISSIONS.QUOTATIONS_UPDATE) && status === QUOTATION_STATUS.DRAFT,
    canSendQuotation: hasPermission(PERMISSIONS.QUOTATIONS_SEND) && status === QUOTATION_STATUS.DRAFT,
    canAcceptQuotation: hasPermission(PERMISSIONS.QUOTATIONS_ACCEPT) && status === QUOTATION_STATUS.SENT,
    canRejectQuotation: hasPermission(PERMISSIONS.QUOTATIONS_REJECT) && status === QUOTATION_STATUS.SENT,
    canCancelQuotation:
      hasPermission(PERMISSIONS.QUOTATIONS_MANAGE) &&
      [QUOTATION_STATUS.DRAFT, QUOTATION_STATUS.SENT].includes(status),
    canReviseQuotation:
      hasPermission(PERMISSIONS.QUOTATIONS_CREATE) &&
      [QUOTATION_STATUS.REJECTED, QUOTATION_STATUS.EXPIRED].includes(status),
  };
};
