export const quotationQueryKeys = Object.freeze({
  all: ["quotations"],
  list: (query) => ["quotations", "list", query],
  detail: (quotationId) => ["quotations", "detail", quotationId],
  print: (quotationId) => ["quotations", "print", quotationId],
  forLead: (leadId, query) => ["quotations", "for-lead", leadId, query],
});
