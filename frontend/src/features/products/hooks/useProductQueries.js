import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_PRODUCT_QUERY } from "../constants";
import { productApi } from "../services";
import { productQueryKeys } from "./productQueryKeys";

const withDefaultQuery = (query) => ({ ...DEFAULT_PRODUCT_QUERY, ...query });

export const useProductList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => productApi.getProducts(requestQuery), [requestQuery]);
  return useAsyncResource(productQueryKeys.list(requestQuery), request, options);
};

export const useProductDetail = (productId, options) => {
  const request = useCallback(() => productApi.getProductById(productId), [productId]);
  return useAsyncResource(productQueryKeys.detail(productId), request, {
    enabled: Boolean(productId) && options?.enabled !== false,
  });
};

export const useProductSummary = (options) => {
  const request = useCallback(() => productApi.getProductSummary(), []);
  return useAsyncResource(productQueryKeys.summary, request, options);
};

export const useProductActions = ({ onSuccess } = {}) => ({
  createProduct: useAsyncMutation(productApi.createProduct, { onSuccess }),
  updateProduct: useAsyncMutation(productApi.updateProduct, { onSuccess }),
  changeProductStatus: useAsyncMutation(productApi.changeProductStatus, { onSuccess }),
});
