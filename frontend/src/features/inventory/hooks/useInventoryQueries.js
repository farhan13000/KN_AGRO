import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_INVENTORY_QUERY, DEFAULT_TRANSACTION_QUERY } from "../constants";
import { inventoryApi } from "../services";
import { inventoryQueryKeys } from "./inventoryQueryKeys";

const withDefaultInventoryQuery = (query) => ({ ...DEFAULT_INVENTORY_QUERY, ...query });
const withDefaultTransactionQuery = (query) => ({ ...DEFAULT_TRANSACTION_QUERY, ...query });

export const useInventoryList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultInventoryQuery(query), [query]);
  const request = useCallback(() => inventoryApi.getInventory(requestQuery), [requestQuery]);
  return useAsyncResource(inventoryQueryKeys.list(requestQuery), request, options);
};

export const useInventoryDetail = (productId, options) => {
  const request = useCallback(() => inventoryApi.getInventoryByProduct(productId), [productId]);
  return useAsyncResource(inventoryQueryKeys.detail(productId), request, {
    enabled: Boolean(productId) && options?.enabled !== false,
  });
};

export const useInventoryTransactions = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultTransactionQuery(query), [query]);
  const request = useCallback(() => inventoryApi.getTransactions(requestQuery), [requestQuery]);
  return useAsyncResource(inventoryQueryKeys.transactions(requestQuery), request, options);
};

export const useProductInventoryTransactions = (productId, query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultTransactionQuery(query), [query]);
  const request = useCallback(
    () => inventoryApi.getProductTransactions(productId, requestQuery),
    [productId, requestQuery],
  );
  return useAsyncResource(inventoryQueryKeys.productTransactions(productId, requestQuery), request, {
    enabled: Boolean(productId) && options?.enabled !== false,
  });
};

export const useLowStockInventory = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultInventoryQuery(query), [query]);
  const request = useCallback(() => inventoryApi.getLowStock(requestQuery), [requestQuery]);
  return useAsyncResource(inventoryQueryKeys.lowStock(requestQuery), request, options);
};

export const useOutOfStockInventory = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultInventoryQuery(query), [query]);
  const request = useCallback(() => inventoryApi.getOutOfStock(requestQuery), [requestQuery]);
  return useAsyncResource(inventoryQueryKeys.outOfStock(requestQuery), request, options);
};

export const useInventorySummary = (options) => {
  const request = useCallback(() => inventoryApi.getInventorySummary(), []);
  return useAsyncResource(inventoryQueryKeys.summary, request, options);
};

export const useInventoryReports = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultTransactionQuery(query), [query]);
  const movementsRequest = useCallback(() => inventoryApi.getMovementsReport(requestQuery), [requestQuery]);
  const valuationRequest = useCallback(() => inventoryApi.getValuationReport(requestQuery), [requestQuery]);

  return {
    movements: useAsyncResource(inventoryQueryKeys.movementsReport(requestQuery), movementsRequest, options),
    valuation: useAsyncResource(inventoryQueryKeys.valuationReport(requestQuery), valuationRequest, options),
  };
};

export const useInventoryActions = ({
  onSuccess,
  refetchInventory,
  refetchProduct,
  refetchSummary,
  refetchTransactions,
} = {}) => {
  const afterStockMutation = useCallback(
    async (payload) => {
      if (onSuccess) await onSuccess(payload);
      refetchInventory?.();
      refetchProduct?.();
      refetchTransactions?.();
      refetchSummary?.();
    },
    [onSuccess, refetchInventory, refetchProduct, refetchSummary, refetchTransactions],
  );

  return {
    createOpeningStock: useAsyncMutation(inventoryApi.createOpeningStock, { onSuccess: afterStockMutation }),
    stockIn: useAsyncMutation(inventoryApi.stockIn, { onSuccess: afterStockMutation }),
    stockOut: useAsyncMutation(inventoryApi.stockOut, { onSuccess: afterStockMutation }),
    adjustStock: useAsyncMutation(inventoryApi.adjustStock, { onSuccess: afterStockMutation }),
    adjustStockIn: useAsyncMutation(inventoryApi.adjustStockIn, { onSuccess: afterStockMutation }),
    adjustStockOut: useAsyncMutation(inventoryApi.adjustStockOut, { onSuccess: afterStockMutation }),
    markDamagedStock: useAsyncMutation(inventoryApi.markDamagedStock, { onSuccess: afterStockMutation }),
  };
};
