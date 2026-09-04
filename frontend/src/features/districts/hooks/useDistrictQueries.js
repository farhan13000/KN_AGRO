import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_DISTRICT_QUERY } from "../constants";
import { districtApi } from "../services";
import { districtQueryKeys } from "./districtQueryKeys";

const withDefaultQuery = (query) => ({ ...DEFAULT_DISTRICT_QUERY, ...query });

export const useDistrictList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => districtApi.getDistricts(requestQuery), [requestQuery]);
  return useAsyncResource(districtQueryKeys.list(requestQuery), request, options);
};

export const useDistrictDetail = (districtId, options) => {
  const request = useCallback(() => districtApi.getDistrictById(districtId), [districtId]);
  return useAsyncResource(districtQueryKeys.detail(districtId), request, {
    enabled: Boolean(districtId) && options?.enabled !== false,
  });
};

export const useDistrictActions = ({ onSuccess } = {}) => ({
  createDistrict: useAsyncMutation(districtApi.createDistrict, { onSuccess }),
  updateDistrict: useAsyncMutation(districtApi.updateDistrict, { onSuccess }),
  requestAssignment: useAsyncMutation(districtApi.requestAssignment, { onSuccess }),
  requestReassignment: useAsyncMutation(districtApi.requestReassignment, { onSuccess }),
  reviewAssignment: useAsyncMutation(districtApi.reviewAssignment, { onSuccess }),
  finalizeAssignment: useAsyncMutation(districtApi.finalizeAssignment, { onSuccess }),
});
