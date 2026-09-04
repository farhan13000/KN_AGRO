export const districtQueryKeys = Object.freeze({
  all: ["districts"],
  lists: ["districts", "list"],
  list: (query) => ["districts", "list", query],
  detail: (districtId) => ["districts", "detail", districtId],
});
