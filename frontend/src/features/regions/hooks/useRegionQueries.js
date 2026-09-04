import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_REGION_QUERY } from "../constants";
import { regionApi } from "../services";
import { regionQueryKeys } from "./regionQueryKeys";

const withDefaultQuery = (query) => ({ ...DEFAULT_REGION_QUERY, ...query });

export const useRegionList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => regionApi.getRegions(requestQuery), [requestQuery]);
  return useAsyncResource(regionQueryKeys.list(requestQuery), request, options);
};

export const useRegionDetail = (regionId, options) => {
  const request = useCallback(() => regionApi.getRegionById(regionId), [regionId]);
  return useAsyncResource(regionQueryKeys.detail(regionId), request, {
    enabled: Boolean(regionId) && options?.enabled !== false,
  });
};

export const useRegionActions = ({ onSuccess } = {}) => ({
  createRegion: useAsyncMutation(regionApi.createRegion, { onSuccess }),
  updateRegion: useAsyncMutation(regionApi.updateRegion, { onSuccess }),
});
