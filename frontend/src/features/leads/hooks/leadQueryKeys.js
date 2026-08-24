export const leadQueryKeys = Object.freeze({
  all: ["leads"],
  list: (query) => ["leads", "list", query],
  detail: (leadId) => ["leads", "detail", leadId],
  followUps: (kind, query) => ["leads", "follow-ups", kind, query],
  unassigned: (query) => ["leads", "unassigned", query],
  summary: ["leads", "summary"],
});
