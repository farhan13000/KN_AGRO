export const categoryQueryKeys = Object.freeze({
  all: ["categories"],
  lists: ["categories", "list"],
  list: (query) => ["categories", "list", query],
  detail: (categoryId) => ["categories", "detail", categoryId],
});
