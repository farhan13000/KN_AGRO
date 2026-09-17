import { useCallback, useMemo } from "react";
import { useAsyncResource } from "../../shared/hooks";
import { geoApi } from "./geoApi";

export const useIndiaStates = (options) => {
  const request = useCallback(() => geoApi.listStates(), []);
  const state = useAsyncResource(["geo", "states"], request, options);
  return { ...state, states: state.data?.states || [] };
};

/** Districts of the chosen states — refetched when that choice changes. */
export const useIndiaDistricts = (states = [], options) => {
  const key = useMemo(() => [...states].sort().join(","), [states]);
  const request = useCallback(() => geoApi.listDistricts(key ? key.split(",") : []), [key]);
  const state = useAsyncResource(["geo", "districts", key], request, { enabled: Boolean(key), ...options });
  return { ...state, districts: state.data?.districts || [] };
};
