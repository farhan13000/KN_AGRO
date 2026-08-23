export const inventoryQueryKeys = Object.freeze({
  all: ["inventory"],
  lists: ["inventory", "list"],
  list: (query) => ["inventory", "list", query],
  lowStock: (query) => ["inventory", "low-stock", query],
  outOfStock: (query) => ["inventory", "out-of-stock", query],
  detail: (productId) => ["inventory", "detail", productId],
  transactions: (query) => ["inventory", "transactions", query],
  productTransactions: (productId, query) => ["inventory", "transactions", productId, query],
  summary: ["inventory", "summary"],
  movementsReport: (query) => ["inventory", "reports", "movements", query],
  valuationReport: (query) => ["inventory", "reports", "valuation", query],
});
