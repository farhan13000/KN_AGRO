import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_ORDER_QUERY } from "../constants";
import { orderApi } from "../services";
import { orderQueryKeys } from "./orderQueryKeys";

const withDefaultOrderQuery = (query) => ({ ...DEFAULT_ORDER_QUERY, ...query });

export const useOrderList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultOrderQuery(query), [query]);
  const request = useCallback(() => orderApi.getOrders(requestQuery), [requestQuery]);
  return useAsyncResource(orderQueryKeys.list(requestQuery), request, options);
};

export const useOrderDetail = (orderId, options) => {
  const request = useCallback(() => orderApi.getOrderById(orderId), [orderId]);
  return useAsyncResource(orderQueryKeys.detail(orderId), request, {
    enabled: Boolean(orderId) && options?.enabled !== false,
  });
};

export const useOrderAttributionRollup = (options) => {
  const request = useCallback(() => orderApi.getAttributionRollup(), []);
  const state = useAsyncResource(orderQueryKeys.attribution, request, options);
  return { ...state, rollup: state.data || null };
};

// One mutation per backend lifecycle action. Prompt 14 requires that after
// any state-changing action the consumer waits for the backend, then
// refetches the Order, the relevant Inventory, and the related Quotation/
// Lead if necessary — that orchestration belongs to the composing
// page/action-bar (which knows which of those resources are actually on
// screen), exactly like Quotations' `useQuotationActions`. This layer
// itself never optimistically rewrites stock or status locally.
export const useOrderActions = ({ onError, onSuccess } = {}) => ({
  createDirectOrder: useAsyncMutation(orderApi.createDirectOrder, { onError, onSuccess }),
  createOrderFromQuotation: useAsyncMutation(orderApi.createOrderFromQuotation, { onError, onSuccess }),
  confirmOrder: useAsyncMutation(orderApi.confirmOrder, { onError, onSuccess }),
  markProcessing: useAsyncMutation(orderApi.markProcessing, { onError, onSuccess }),
  markReady: useAsyncMutation(orderApi.markReady, { onError, onSuccess }),
  dispatchOrder: useAsyncMutation(orderApi.dispatchOrder, { onError, onSuccess }),
  markDelivered: useAsyncMutation(orderApi.markDelivered, { onError, onSuccess }),
  cancelOrder: useAsyncMutation(orderApi.cancelOrder, { onError, onSuccess }),
});
