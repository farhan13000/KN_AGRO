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
export const getQuotationCapabilities = ({ currentUserId, hasPermission, quotation }) => {
  const status = quotation?.status;

  // Accepting or rejecting is not a decision anyone here makes — it is a
  // report of what the CUSTOMER decided, and only the person who spoke
  // to them can make it. The backend picks that person from the lead's
  // own assignment (leadResponder.js) and names them on the record as
  // `awaitingAnswerFrom`; this mirrors that choice rather than
  // re-deriving it, so the two can never disagree about whose answer it
  // is. An unassigned lead resolves to nobody, and there the backend
  // deliberately falls open rather than stranding the quotation — so
  // this does too.
  const responderUserId = quotation?.awaitingAnswerFrom?.user?._id;
  const isLeadResponder = !responderUserId || String(responderUserId) === String(currentUserId ?? "");

  return {
    canListQuotation: hasPermission(PERMISSIONS.QUOTATIONS_READ),
    canViewQuotation: hasPermission(PERMISSIONS.QUOTATIONS_READ),
    canPrintQuotation: hasPermission(PERMISSIONS.QUOTATIONS_READ),
    canCreateQuotation: hasPermission(PERMISSIONS.QUOTATIONS_CREATE),
    canEditQuotation: hasPermission(PERMISSIONS.QUOTATIONS_UPDATE) && status === QUOTATION_STATUS.DRAFT,
    canSendQuotation: hasPermission(PERMISSIONS.QUOTATIONS_SEND) && status === QUOTATION_STATUS.DRAFT,
    // Pressing Send does one of two things depending on who is pressing
    // it (see the backend's documentApproval.js), so the button has to
    // say which. Anyone WITHOUT the approve permission is submitting for
    // approval, not sending.
    sendGoesForApproval:
      hasPermission(PERMISSIONS.QUOTATIONS_SEND) && !hasPermission(PERMISSIONS.QUOTATIONS_APPROVE),
    // Answering on someone else's submission. The permission alone is
    // never enough — the document has to actually be waiting.
    canApproveQuotation:
      hasPermission(PERMISSIONS.QUOTATIONS_APPROVE) && status === QUOTATION_STATUS.PENDING_APPROVAL,
    canAcceptQuotation:
      hasPermission(PERMISSIONS.QUOTATIONS_ACCEPT) && status === QUOTATION_STATUS.SENT && isLeadResponder,
    canRejectQuotation:
      hasPermission(PERMISSIONS.QUOTATIONS_REJECT) && status === QUOTATION_STATUS.SENT && isLeadResponder,
    // Everyone else looking at a quotation that is out with the
    // customer. There is nothing for them to press, and saying so beats
    // an actions panel that silently has fewer buttons than they
    // remember.
    isAwaitingLeadAnswer: status === QUOTATION_STATUS.SENT && !isLeadResponder,
    canCancelQuotation:
      hasPermission(PERMISSIONS.QUOTATIONS_MANAGE) &&
      [QUOTATION_STATUS.DRAFT, QUOTATION_STATUS.PENDING_APPROVAL, QUOTATION_STATUS.SENT].includes(status),
    canReviseQuotation:
      hasPermission(PERMISSIONS.QUOTATIONS_CREATE) &&
      [QUOTATION_STATUS.REJECTED, QUOTATION_STATUS.EXPIRED].includes(status),
    // Phase 6 Prompt 23: cross-domain, same shape as canCreateQuotation on
    // getLeadCapabilities — "can create an Order" gated on the Orders
    // permission (not a Quotations one) plus this specific Quotation being
    // ACCEPTED (the only source status createOrderFromQuotation accepts,
    // per order.service.js — 409 otherwise). Once the Order is created the
    // backend flips this same quotation to CONVERTED, so the button
    // naturally stops rendering afterward without any extra bookkeeping.
    canCreateOrderFromQuotation:
      hasPermission(PERMISSIONS.ORDERS_CREATE_FROM_QUOTATION) && status === QUOTATION_STATUS.ACCEPTED,
    // Accepted, and the reader is not the one who turns it into an
    // order. Worth saying rather than leaving a blank space where they
    // expected the next step: the person who just recorded the
    // customer's yes is entitled to know what happens now.
    isAwaitingManagerOrder:
      status === QUOTATION_STATUS.ACCEPTED &&
      !hasPermission(PERMISSIONS.ORDERS_CREATE_FROM_QUOTATION),
  };
};
