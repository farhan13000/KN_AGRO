import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_CATEGORY_QUERY } from "../constants";
import { categoryApi } from "../services";
import { categoryQueryKeys } from "./categoryQueryKeys";

const withDefaultQuery = (query) => ({ ...DEFAULT_CATEGORY_QUERY, ...query });

export const useCategoryList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => categoryApi.getCategories(requestQuery), [requestQuery]);
  return useAsyncResource(categoryQueryKeys.list(requestQuery), request, options);
};

export const useCategoryDetail = (categoryId, options) => {
  const request = useCallback(() => categoryApi.getCategoryById(categoryId), [categoryId]);
  return useAsyncResource(categoryQueryKeys.detail(categoryId), request, {
    enabled: Boolean(categoryId) && options?.enabled !== false,
  });
};

export const useCategoryActions = ({ onSuccess } = {}) => ({
  createCategory: useAsyncMutation(categoryApi.createCategory, { onSuccess }),
  updateCategory: useAsyncMutation(categoryApi.updateCategory, { onSuccess }),
  changeCategoryStatus: useAsyncMutation(categoryApi.changeCategoryStatus, { onSuccess }),
});
