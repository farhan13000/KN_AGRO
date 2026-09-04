import { useEffect } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { notificationApi } from "../services";

const UNREAD_COUNT_POLL_MS = 30000;
const RECENT_LIST_LIMIT = 20;

/**
 * Backs the notification bell: an always-live unread badge (polled — this
 * codebase has no websocket/push channel for notifications) plus a
 * recent-notifications list that only fetches once the dropdown is
 * actually opened (`isOpen`), matching `useAsyncResource`'s own
 * `enabled` gate rather than fetching a list nobody's looking at yet.
 */
export const useNotificationCenter = (isOpen) => {
  const countState = useAsyncResource(["notifications", "unread-count"], () => notificationApi.getUnreadCount());
  const listState = useAsyncResource(
    ["notifications", "recent"],
    () => notificationApi.listNotifications({ limit: RECENT_LIST_LIMIT, sortOrder: "desc" }),
    { enabled: isOpen },
  );

  useEffect(() => {
    const interval = window.setInterval(() => countState.refetch(), UNREAD_COUNT_POLL_MS);
    return () => window.clearInterval(interval);
  }, [countState.refetch]);

  const refreshAfterMutation = () => {
    countState.refetch();
    listState.refetch();
  };

  const markReadMutation = useAsyncMutation((notificationId) => notificationApi.markNotificationRead(notificationId), {
    onSuccess: refreshAfterMutation,
  });
  const markAllReadMutation = useAsyncMutation(() => notificationApi.markAllNotificationsRead(), {
    onSuccess: refreshAfterMutation,
  });
  const archiveMutation = useAsyncMutation((notificationId) => notificationApi.archiveNotification(notificationId), {
    onSuccess: refreshAfterMutation,
  });

  return {
    unreadCount: countState.data?.count ?? 0,
    notifications: listState.data?.notifications ?? [],
    isListLoading: listState.isLoading,
    isListError: listState.isError,
    listErrorMessage: listState.errorMessage,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isLoading,
    archive: archiveMutation.mutate,
  };
};
