export const productQueryKeys = Object.freeze({
  all: ["products"],
  lists: ["products", "list"],
  list: (query) => ["products", "list", query],
  detail: (productId) => ["products", "detail", productId],
  summary: ["products", "summary"],
});
