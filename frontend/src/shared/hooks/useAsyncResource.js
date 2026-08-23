import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../core/api";

export const useAsyncResource = (queryKey, request, { enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(enabled));
  const [refreshIndex, setRefreshIndex] = useState(0);
  const stableKey = JSON.stringify(queryKey);

  const refetch = useCallback(() => {
    setRefreshIndex((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }

    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    request()
      .then((payload) => {
        if (isCurrent) setData(payload);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [enabled, refreshIndex, stableKey]);

  return {
    data,
    error,
    errorMessage: error ? getApiErrorMessage(error) : "",
    isError: Boolean(error),
    isLoading,
    queryKey,
    refetch,
  };
};

export const useAsyncMutation = (mutationFn, { onSuccess } = {}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await mutationFn(...args);
        if (onSuccess) await onSuccess(payload);
        return payload;
      } catch (mutationError) {
        setError(mutationError);
        throw mutationError;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess],
  );

  return {
    error,
    errorMessage: error ? getApiErrorMessage(error) : "",
    isError: Boolean(error),
    isLoading,
    mutate,
  };
};

export const useDebouncedValue = (value, delay = 350) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
};
