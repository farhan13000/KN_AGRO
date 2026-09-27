import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { notificationApi } from "../services";

const BADGE_POLL_MS = 30000;

export const NOTIFICATION_BADGE_QUERY_KEY = ["notifications", "unread-counts"];

/**
 * Unread counts, split by module and by whether they need the user to
 * act. Two very different places need this — the bell in the header and
 * every badged item in the sidebar — and both simply call this hook:
 * TanStack dedupes by query key, so they share ONE request and one
 * 30s poll no matter how many components mount it. That is why there is
 * no context or prop threading here.
 *
 * Polling (not push) because this codebase has no websocket channel; a
 * badge being up to 30s stale is fine, since it points at work rather
 * than reporting a number anyone acts on directly.
 */
export const useNotificationBadges = () => {
  const queryClient = useQueryClient();
  const countsState = useAsyncResource(NOTIFICATION_BADGE_QUERY_KEY, () => notificationApi.getUnreadCounts(), {
    refetchInterval: BADGE_POLL_MS,
  });

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_BADGE_QUERY_KEY }),
    [queryClient],
  );

  const markModuleRead = useAsyncMutation((module) => notificationApi.markModuleNotificationsRead(module), {
    onSuccess: refresh,
  });

  const byModule = countsState.data?.byModule ?? {};

  /**
   * Accepts several modules because some screens are a merge of them —
   * the employee portal's "My Workspace" holds attendance, DSRs, leave
   * and reports behind one nav entry, and its badge has to speak for all
   * of them.
   */
  const countFor = (moduleOrModules) => {
    if (!moduleOrModules) return 0;
    const modules = Array.isArray(moduleOrModules) ? moduleOrModules : [moduleOrModules];
    return modules.reduce((sum, module) => sum + (byModule[module] ?? 0), 0);
  };

  return {
    total: countsState.data?.total ?? 0,
    actionRequired: countsState.data?.actionRequired ?? 0,
    byModule,
    countFor,
    markModuleRead: markModuleRead.mutate,
    refresh,
  };
};
