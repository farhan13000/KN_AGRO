import { useMemo } from "react";
import { useAsyncMutation, useAsyncResource, useDebouncedValue } from "../../../shared/hooks";
import { conversationApi } from "../services";

const INBOX_LIMIT = 50;
/**
 * The chat list refreshes on its own every 20 seconds. There is no
 * websocket here — the backend is REST only — so this poll IS how a
 * reply arrives. Twenty seconds is the compromise: fast enough that a
 * conversation does not feel dead, slow enough that a phone on mobile
 * data is not paying for it all afternoon.
 */
const INBOX_POLL_MS = 20000;

/**
 * The left-hand side of the Chats screen: the threads you already have,
 * and the people you could start one with.
 *
 * The directory is fetched separately and only when asked for (`enabled`)
 * — most visits are to carry on an existing conversation, and the list of
 * every colleague you may write to is the more expensive of the two.
 */
export const useChatInbox = ({ directorySearch = "", isPickerOpen = false } = {}) => {
  const debouncedSearch = useDebouncedValue(directorySearch, 300);

  const inboxState = useAsyncResource(
    ["conversations", "inbox"],
    () => conversationApi.listConversations({ limit: INBOX_LIMIT, sortOrder: "desc" }),
    { refetchInterval: INBOX_POLL_MS },
  );

  const directoryState = useAsyncResource(
    ["conversations", "directory", debouncedSearch],
    () => conversationApi.listDirectory(debouncedSearch ? { search: debouncedSearch } : undefined),
    { enabled: isPickerOpen },
  );

  const openDirect = useAsyncMutation((targetUserId) => conversationApi.openDirectConversation(targetUserId));

  const conversations = useMemo(() => inboxState.data?.conversations ?? [], [inboxState.data]);

  return {
    conversations,
    isLoading: inboxState.isLoading,
    isError: inboxState.isError,
    errorMessage: inboxState.errorMessage,
    refetch: inboxState.refetch,

    people: directoryState.data?.people ?? [],
    isDirectoryLoading: directoryState.isLoading,
    directoryErrorMessage: directoryState.errorMessage,

    openDirect: openDirect.mutate,
    isOpening: openDirect.isLoading,
    openErrorMessage: openDirect.errorMessage,
  };
};
