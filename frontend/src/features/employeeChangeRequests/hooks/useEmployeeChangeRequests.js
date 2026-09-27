import { useCallback } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { employeeChangeRequestApi } from "../services";

export const employeeChangeRequestKeys = {
  list: (query) => ["employee-change-requests", query],
};

export const useEmployeeChangeRequests = (query = {}, options) => {
  const request = useCallback(() => employeeChangeRequestApi.list(query), [query]);
  return useAsyncResource(employeeChangeRequestKeys.list(query), request, options);
};

export const useEmployeeChangeRequestActions = ({ onError, onSuccess } = {}) => ({
  decide: useAsyncMutation(employeeChangeRequestApi.decide, { onError, onSuccess }),
});
