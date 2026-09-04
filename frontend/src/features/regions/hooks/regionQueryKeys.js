export const regionQueryKeys = Object.freeze({
  all: ["regions"],
  lists: ["regions", "list"],
  list: (query) => ["regions", "list", query],
  detail: (regionId) => ["regions", "detail", regionId],
});
