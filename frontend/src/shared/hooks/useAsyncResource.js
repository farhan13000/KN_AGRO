import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../core/api";

/**
 * Backed by TanStack Query, but the SIGNATURE AND RETURN SHAPE below are
 * deliberately unchanged from the hand-rolled version this replaced — the
 * ~34 feature hooks built on it need no edits, which is what keeps a
 * data-layer swap of this size from touching every screen in the app.
 *
 * What actually changes for callers is only the good part: results are
 * now cached by queryKey, so revisiting a screen renders the last known
 * data immediately instead of resetting to null and showing a spinner,
 * and two components asking for the same key share one request instead
 * of each firing their own.
 */
export const useAsyncResource = (queryKey, request, { enabled = true } = {}) => {
  const query = useQuery({
    // Callers pass either an array key or a bare value; v5 requires an array.
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: request,
    enabled,
  });

  return {
    // `?? null` keeps the original contract — the old hook started at
    // null, TanStack starts at undefined.
    data: query.data ?? null,
    error: query.error ?? null,
    errorMessage: query.error ? getApiErrorMessage(query.error) : "",
    isError: query.isError,
    // v5's isLoading is "pending AND fetching", so it is false both when
    // disabled and when cached data is being refreshed in the background
    // — the latter is exactly the no-blank-spinner behavior we want.
    isLoading: query.isLoading,
    queryKey,
    refetch: query.refetch,
  };
};

export const useAsyncMutation = (mutationFn, { onError, onSuccess } = {}) => {
  const mutation = useMutation({
    // Existing call sites pass MULTIPLE positional arguments (e.g.
    // `mutate(promotionId, managerId)`), while v5 hands the mutationFn a
    // single `variables`. The tuple is packed by `mutate` below and
    // spread back here, so every existing call site keeps working.
    mutationFn: (args) => mutationFn(...args),
  });

  const { mutateAsync } = mutation;

  const mutate = useCallback(
    async (...args) => {
      try {
        // mutateAsync, not mutate: the original returned the payload and
        // threw on failure, and callers `await` it and `.catch(...)`.
        // v5's `mutate` is fire-and-forget and would silently swallow both.
        const payload = await mutateAsync(args);
        if (onSuccess) await onSuccess(payload);
        return payload;
      } catch (mutationError) {
        if (onError) await onError(mutationError);
        throw mutationError;
      }
    },
    [mutateAsync, onError, onSuccess],
  );

  return {
    error: mutation.error ?? null,
    errorMessage: mutation.error ? getApiErrorMessage(mutation.error) : "",
    isError: mutation.isError,
    // v5 renamed the mutation flag to isPending.
    isLoading: mutation.isPending,
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
