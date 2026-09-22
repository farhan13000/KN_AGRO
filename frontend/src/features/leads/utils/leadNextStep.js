import { LEAD_STATUS } from "../constants/lead.constants.js";

/**
 * THE ONE THING TO DO NEXT on a lead, and the sentence that explains it.
 *
 * The lead page used to answer "what CAN I do here" with ten buttons of
 * equal weight — four of which only edited the lead and four of which
 * only moved its stage. That is a map of the API, not of the work.
 * Someone opening a lead they have never seen has one real question:
 * what is the next thing, and is it mine? This answers exactly that,
 * and everything else moves behind "More".
 *
 * WHY A PURE FUNCTION. The answer depends on the lead's stage, on who is
 * looking (a field officer asks for a quotation, a manager prices one),
 * and on what already exists against the lead (a quotation waiting for
 * the customer, an order nobody has confirmed). That is enough branching
 * to deserve one readable place, separate from the markup, where the
 * whole ladder can be read top to bottom and corrected.
 *
 * WHAT IT DELIBERATELY IS NOT. It never blocks anything. The backend
 * allows movement in both directions between the active stages on
 * purpose (lead.constants.js: "a rigid linear pipeline isn't how real
 * sales conversations go, and staff need to correct mistakes"), and a UI
 * that hard-locked the sequence would just generate requests to unlock
 * it. So this only decides what is OFFERED first; "Change stage" stays
 * in the More menu at every stage, including this one.
 *
 * Returns null when there is genuinely nothing to suggest — a lost or
 * closed lead, or a reader with no permissions on it. The panel then
 * says nothing rather than inventing a step.
 */

/** The stages shown on the strip, in order. Terminal states are not on it. */
export const PIPELINE_STAGES = Object.freeze([
  { status: LEAD_STATUS.NEW, label: "New" },
  { status: LEAD_STATUS.CONTACTED, label: "Contacted" },
  { status: LEAD_STATUS.QUALIFIED, label: "Qualified" },
  { status: LEAD_STATUS.QUOTATION_SENT, label: "Quotation" },
  { status: LEAD_STATUS.CONVERTED, label: "Won" },
]);

/**
 * Where on the strip a lead sits. FOLLOW_UP and NEGOTIATION are real
 * statuses but not their own step — they are what "Contacted" and
 * "Quotation" look like while they are still going on, so they light the
 * step they belong to rather than adding two more dots nobody needs.
 */
const STAGE_INDEX = Object.freeze({
  [LEAD_STATUS.NEW]: 0,
  [LEAD_STATUS.CONTACTED]: 1,
  [LEAD_STATUS.FOLLOW_UP]: 1,
  [LEAD_STATUS.QUALIFIED]: 2,
  [LEAD_STATUS.QUOTATION_SENT]: 3,
  [LEAD_STATUS.NEGOTIATION]: 3,
  [LEAD_STATUS.CONVERTED]: 4,
});

export const getPipelinePosition = (status) => STAGE_INDEX[status] ?? -1;

const firstName = (lead) => lead?.name || "this lead";

/**
 * Actions are returned as an `id` plus its label and copy — never as a
 * handler or an icon. The panel owns those: a util that returned JSX
 * could not be read without reading the panel too, and a util that
 * returned handlers would need every dialog and mutation in scope.
 */
const action = (id, label, extra = {}) => ({ id, label, ...extra });

export const getLeadNextStep = ({ capabilities = {}, lead, work = {} }) => {
  const status = lead?.status;
  const {
    canCompleteFollowUp,
    canCreateQuotation,
    canQualify,
    canLogFirstContact,
    canRequestQuotation,
    canScheduleFollowUp,
  } = capabilities;

  const { openQuotation, acceptedQuotation, orderAwaitingConfirm, pendingRequestTypes = [] } = work;

  // ---- Nothing left to suggest ----------------------------------------
  if (status === LEAD_STATUS.LOST) {
    return {
      headline: "This lead was lost",
      description: lead?.lostReason
        ? `Reason given: ${lead.lostReason}`
        : "Nothing further is expected on it.",
      primary: null,
      secondary: [],
    };
  }
  if (status === LEAD_STATUS.CLOSED) {
    return {
      headline: "This lead is closed",
      description: "It is kept for the record. Nothing further is expected on it.",
      primary: null,
      secondary: [],
    };
  }
  if (status === LEAD_STATUS.CONVERTED) {
    return {
      headline: `${firstName(lead)} became a customer`,
      description: "The order carries on from here. Nothing more is needed on the lead itself.",
      primary: null,
      secondary: [],
    };
  }

  // ---- Somebody has to confirm an order --------------------------------
  // Ahead of the stage ladder on purpose: an order sitting unconfirmed is
  // holding no stock and going nowhere, whatever the lead's own stage says.
  if (orderAwaitingConfirm) {
    return {
      headline: `Order ${orderAwaitingConfirm.orderNumber} is waiting to be confirmed`,
      description: "Nothing is reserved against it until a manager confirms it.",
      primary: action("open-order", "Open the order", { orderId: orderAwaitingConfirm._id }),
      secondary: [],
    };
  }

  // ---- A quotation is out with the customer ----------------------------
  if (openQuotation) {
    const waitingOn = openQuotation.awaitingAnswerFrom?.user?.name;
    return {
      headline: `Find out what ${firstName(lead)} said`,
      description: waitingOn
        ? `${openQuotation.quotationNumber} went out. ${waitingOn} records their answer — accepting or refusing is done on the quotation itself.`
        : `${openQuotation.quotationNumber} went out. The answer is recorded on the quotation itself.`,
      // Straight to the quotation rather than repeating Accept/Reject
      // here: those carry a confirmation and a reason box, and a second
      // copy of that decision is a second thing to keep in step.
      primary: action("open-quotation", "Record their answer", { quotationId: openQuotation._id }),
      secondary: [],
    };
  }

  if (acceptedQuotation) {
    return {
      headline: `${firstName(lead)} accepted ${acceptedQuotation.quotationNumber}`,
      description: "A manager turns it into an order from the quotation page.",
      primary: action("open-quotation", "Open the quotation", { quotationId: acceptedQuotation._id }),
      secondary: [],
    };
  }

  // ---- The ordinary ladder ---------------------------------------------
  if (status === LEAD_STATUS.NEW && canLogFirstContact) {
    return {
      headline: `Nobody has spoken to ${firstName(lead)} yet`,
      description: "Call or visit them, then record that the conversation happened.",
      primary: action("log-first-contact", "Log first contact"),
      secondary: canScheduleFollowUp ? [action("schedule-follow-up", "Schedule a follow-up")] : [],
    };
  }

  if (status === LEAD_STATUS.FOLLOW_UP && canCompleteFollowUp) {
    return {
      headline: "A follow-up is due",
      description: "Record how it went. You can book the next one at the same time.",
      primary: action("complete-follow-up", "Complete the follow-up"),
      secondary: canQualify ? [action("qualify", "Mark qualified")] : [],
    };
  }

  if ((status === LEAD_STATUS.CONTACTED || status === LEAD_STATUS.FOLLOW_UP) && lead?.nextFollowUpAt && canQualify) {
    const followUpDate = new Date(lead.nextFollowUpAt);
    const formatted = followUpDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    return {
      headline: `Follow-up scheduled for ${formatted}`,
      description: "A follow-up is already booked. Complete it when done, or mark this lead qualified if you are ready to quote.",
      primary: canCompleteFollowUp ? action("complete-follow-up", "Complete the follow-up") : null,
      secondary: [action("qualify", "Mark qualified")],
    };
  }

  if ((status === LEAD_STATUS.CONTACTED || status === LEAD_STATUS.FOLLOW_UP) && canQualify) {
    return {
      headline: "Decide what this lead is worth",
      description:
        "You have spoken to them. Either book the next call, or mark them qualified so a quotation can be priced.",
      primary: action("qualify", "Mark qualified"),
      secondary: canScheduleFollowUp ? [action("schedule-follow-up", "Schedule a follow-up")] : [],
    };
  }

  if (status === LEAD_STATUS.QUALIFIED && canCreateQuotation) {
    const count = (lead?.interestedProducts || []).length;
    return {
      headline: `Price a quotation for ${firstName(lead)}`,
      description: count
        ? `Built from the ${count} product${count === 1 ? "" : "s"} and quantities already recorded on this lead.`
        : "Nothing has been recorded against this lead yet — add the products they asked for first.",
      primary: action("create-quotation", "Create quotation"),
      secondary: [],
    };
  }

  if (status === LEAD_STATUS.QUALIFIED && canRequestQuotation) {
    const alreadyAsked = pendingRequestTypes.includes("CREATE_QUOTATION");
    return {
      headline: alreadyAsked ? "Your manager has been asked" : "Ask your manager for a quotation",
      description: alreadyAsked
        ? "The request is open. It closes by itself the moment they create the quotation."
        : "You cannot price a quotation yourself. Your manager is notified and it comes back here.",
      primary: alreadyAsked ? null : action("request-quotation", "Ask for a quotation"),
      secondary: [],
    };
  }

  // Qualified, and this reader can neither price nor ask — or a stage
  // nothing above matched. Say where it stands, offer nothing.
  if (status === LEAD_STATUS.QUALIFIED) {
    return {
      headline: "Ready for a quotation",
      description: "A manager prices it from the products recorded on this lead.",
      primary: null,
      secondary: [],
    };
  }

  if (canScheduleFollowUp) {
    return {
      headline: "Keep this lead moving",
      description: "Book the next conversation so it does not go quiet.",
      primary: action("schedule-follow-up", "Schedule a follow-up"),
      secondary: [],
    };
  }

  return null;
};
