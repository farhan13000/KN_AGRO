import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { notificationApi } from "../services";
import { useNotificationBadges } from "./useNotificationBadges";

const RECENT_LIST_LIMIT = 20;

/**
 * Backs the notification bell: a live unread badge plus a recent list
 * that only fetches once the dropdown is actually opened (`isOpen`),
 * matching `useAsyncResource`'s own `enabled` gate rather than fetching
 * a list nobody's looking at yet.
 *
 * The badge numbers come from useNotificationBadges, the same hook the
 * sidebar uses — one shared query and one poll for the whole app, rather
 * than this hook keeping a second count of its own.
 */
export const useNotificationCenter = (isOpen) => {
  const badges = useNotificationBadges();
  const listState = useAsyncResource(
    ["notifications", "recent"],
    () => notificationApi.listNotifications({ limit: RECENT_LIST_LIMIT, sortOrder: "desc" }),
    { enabled: isOpen },
  );

  // A SECOND, unread-only request, and the reason for it: the recent
  // list is the newest 20 of everything, so a decision that has been
  // waiting a while gets pushed out of it by ordinary chatter — the one
  // item that must never be hidden is the one most likely to be. Every
  // action-required item is by definition unread, so this window always
  // contains the whole "needs your action" section.
  const unreadState = useAsyncResource(
    ["notifications", "unread-recent"],
    () => notificationApi.listNotifications({ isRead: "false", limit: RECENT_LIST_LIMIT, sortOrder: "desc" }),
    { enabled: isOpen },
  );

  const refreshAfterMutation = () => {
    badges.refresh();
    listState.refetch();
    unreadState.refetch();
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
    // Kept for callers that just want "how many unread" — unchanged
    // meaning from before this hook was split.
    unreadCount: badges.total,
    // How many of those actually ask the user to do something. The bell
    // leads with this, because 3 decisions waiting is the useful signal,
    // not 23 things having happened.
    actionRequiredCount: badges.actionRequired,
    notifications: listState.data?.notifications ?? [],
    unreadNotifications: unreadState.data?.notifications ?? [],
    isListLoading: listState.isLoading,
    isListError: listState.isError,
    listErrorMessage: listState.errorMessage,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isLoading,
    archive: archiveMutation.mutate,
  };
};
