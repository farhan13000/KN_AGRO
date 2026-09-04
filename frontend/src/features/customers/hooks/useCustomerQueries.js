import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_CUSTOMER_QUERY } from "../constants";
import { customerApi } from "../services";
import { customerQueryKeys } from "./customerQueryKeys";

const withDefaultCustomerQuery = (query) => ({ ...DEFAULT_CUSTOMER_QUERY, ...query });

export const useCustomerList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultCustomerQuery(query), [query]);
  const request = useCallback(() => customerApi.getCustomers(requestQuery), [requestQuery]);
  return useAsyncResource(customerQueryKeys.list(requestQuery), request, options);
};

export const useCustomerDetail = (customerId, options) => {
  const request = useCallback(() => customerApi.getCustomerById(customerId), [customerId]);
  return useAsyncResource(customerQueryKeys.detail(customerId), request, {
    enabled: Boolean(customerId) && options?.enabled !== false,
  });
};

// Powers the Customer Detail page's Orders/Invoices/Payments/Outstanding
// sections (Prompt 20) — a "latest 5 + count" summary per resource, never
// a full/paginated list. Kept as its own hook (not folded into
// useCustomerDetail) so the detail page can genuinely load it lazily, per
// Prompt 20's explicit "load tabs lazily" instruction.
export const useCustomerHistory = (customerId, options) => {
  const request = useCallback(() => customerApi.getCustomerHistory(customerId), [customerId]);
  return useAsyncResource(customerQueryKeys.history(customerId), request, {
    enabled: Boolean(customerId) && options?.enabled !== false,
  });
};

// One mutation per backend action, deliberately not chained together —
// each consuming page/dialog composes its own `onSuccess` (refetch this
// customer / refetch the list), same posture as every other Phase 5/6
// action hook. No optimistic local writes.
export const useCustomerActions = ({ onError, onSuccess } = {}) => ({
  createCustomer: useAsyncMutation(customerApi.createCustomer, { onError, onSuccess }),
  updateCustomer: useAsyncMutation(customerApi.updateCustomer, { onError, onSuccess }),
  changeCustomerStatus: useAsyncMutation(customerApi.changeCustomerStatus, { onError, onSuccess }),
});
