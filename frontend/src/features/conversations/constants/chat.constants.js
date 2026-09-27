/**
 * Mirrors the backend's CHAT_RELATIONSHIP (see
 * modules/conversations/conversation.constants.js) — the reason a person
 * appears in your directory at all, shown beside their name so a list of
 * names is a list of colleagues you recognise.
 */
export const CHAT_RELATIONSHIP_LABELS = Object.freeze({
  SENIOR: "Your senior",
  REPORT: "Reports to you",
  TEAMMATE: "Your team",
  HEAD_OFFICE: "Head office",
  STAFF: "Staff",
});

/** Grouping order for the people picker: the people you work with most closely, first. */
export const RELATIONSHIP_ORDER = Object.freeze(["TEAMMATE", "REPORT", "SENIOR", "HEAD_OFFICE", "STAFF"]);

export const getRelationshipLabel = (relationship) => CHAT_RELATIONSHIP_LABELS[relationship] || "Staff";

/**
 * A phone number as WhatsApp wants it: digits only, with India's country
 * code where the number is a bare 10-digit Indian mobile. Staff numbers
 * are stored however whoever typed them felt like ("98765 43210",
 * "+91-9876543210"), and wa.me accepts none of those spellings.
 *
 * Returns "" when there is nothing usable, so the caller can leave the
 * button out rather than render one that opens WhatsApp on an error.
 */
export const toWhatsAppNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  // Already carries a country code (12 for +91, or another country's).
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return "";
};

export const buildWhatsAppLink = (phone, message = "") => {
  const number = toWhatsAppNumber(phone);
  if (!number) return "";
  return message ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : `https://wa.me/${number}`;
};

export const buildCallLink = (phone) => {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
};
