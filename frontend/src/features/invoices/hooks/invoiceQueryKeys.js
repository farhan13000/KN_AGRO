export const invoiceQueryKeys = Object.freeze({
  all: ["invoices"],
  list: (query) => ["invoices", "list", query],
  detail: (invoiceId) => ["invoices", "detail", invoiceId],
  summary: ["invoices", "summary"],
  print: (invoiceId) => ["invoices", "print", invoiceId],
});
