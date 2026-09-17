import { useIsFetching } from "@tanstack/react-query";

/**
 * A slim, fixed bar at the very top of the viewport that lights up
 * whenever any TanStack Query request is in flight — including a
 * background refetch of already-cached data (see useAsyncResource's own
 * header comment on why revisiting a screen no longer blanks to a
 * spinner). This is the visible half of that: something IS happening,
 * without discarding the content already on screen to say so.
 *
 * Deliberately tracks queries only, not mutations — a mutation already
 * has its own per-button isLoading (from useAsyncMutation) disabling the
 * exact control the user just clicked, which is the right feedback for
 * "an action is in flight." This bar is about passive background data
 * refresh, a different signal.
 *
 * Mounted once in App.jsx, inside AppProviders' QueryClientProvider, so
 * it covers the public site and all three portals without any of the ~34
 * feature hook files or their pages needing to know it exists.
 */
export default function GlobalFetchIndicator() {
  const fetchingCount = useIsFetching();

  if (!fetchingCount) return null;

  return <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[100] h-[3px] animate-pulse bg-agriculture" />;
}
