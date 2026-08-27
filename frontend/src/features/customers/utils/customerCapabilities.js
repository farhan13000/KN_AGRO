import { PERMISSIONS } from "../../../shared/constants/permissions.constants.js";

// Prompt 62 (Permission Capability Mapping) surfaced that Customer's own
// permission checks were inline in two different components
// (CustomerListView's Create button, CustomerDetailView's Edit button) —
// exactly the "scattered role checks" the prompt says not to do. Unlike
// Order/Invoice, Customer has no status-dependent gating at all (Customer
// is unrestricted shared master data — see
// PHASE6_FRONTEND_API_CONTRACT.md), so this is a thin, permission-only
// mapping, but it's still consolidated here rather than left scattered.
export const getCustomerCapabilities = ({ hasPermission }) => ({
  canListCustomer: hasPermission(PERMISSIONS.CUSTOMERS_READ),
  canViewCustomer: hasPermission(PERMISSIONS.CUSTOMERS_READ),
  canCreateCustomer: hasPermission(PERMISSIONS.CUSTOMERS_CREATE),
  canEditCustomer: hasPermission(PERMISSIONS.CUSTOMERS_UPDATE),
});
