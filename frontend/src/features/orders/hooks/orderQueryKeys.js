export const orderQueryKeys = Object.freeze({
  all: ["orders"],
  list: (query) => ["orders", "list", query],
  detail: (orderId) => ["orders", "detail", orderId],
  attribution: ["orders", "attribution"],
});
