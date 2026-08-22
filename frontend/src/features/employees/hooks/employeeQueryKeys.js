export const employeeQueryKeys = Object.freeze({
  all: ["employees"],
  lists: ["employees", "list"],
  list: (query) => ["employees", "list", query],
  detail: (employeeId) => ["employees", "detail", employeeId],
  me: ["employees", "me"],
  pending: (query) => ["employees", "pending", query],
  directReports: (employeeId, query) => ["employees", "reports", employeeId, query],
  myTeam: (query) => ["employees", "my-team", query],
  hierarchy: ["employees", "hierarchy"],
  summary: ["employees", "summary"],
  actionRequests: (query) => ["employees", "action-requests", query],
});
