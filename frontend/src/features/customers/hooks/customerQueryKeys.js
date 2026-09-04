export const customerQueryKeys = Object.freeze({
  all: ["customers"],
  list: (query) => ["customers", "list", query],
  detail: (customerId) => ["customers", "detail", customerId],
  history: (customerId) => ["customers", "history", customerId],
});
