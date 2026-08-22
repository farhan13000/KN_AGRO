import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import PageLoader from "./PageLoader";
import { getApiErrorMessage, getApiState } from "../../core/api/apiState";

export default function ApiState({
  children,
  data,
  emptyMessage = "No information is available yet.",
  error,
  isLoading,
  loadingMessage = "Loading...",
}) {
  const state = getApiState({ data, error, isLoading });

  if (state === "loading") {
    return <PageLoader message={loadingMessage} />;
  }

  if (state === "error") {
    return <ErrorState message={getApiErrorMessage(error)} />;
  }

  if (state === "empty") {
    return <EmptyState description={emptyMessage} title="Nothing to show" />;
  }

  return children;
}

