export const paymentQueryKeys = Object.freeze({
  all: ["payments"],
  list: (query) => ["payments", "list", query],
  forInvoice: (invoiceId, query) => ["payments", "for-invoice", invoiceId, query],
});
