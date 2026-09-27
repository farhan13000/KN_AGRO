import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { conversationApi } from "../services";

/** The newest N. A staff chat capped at ~15 messages a day never needs more on screen at once. */
const WINDOW_SIZE = 60;
/**
 * Faster than the inbox poll (20s) because this is the screen someone is
 * actually looking at, waiting for an answer. Still a poll, not a socket
 * — see useChatInbox for why.
 */
const THREAD_POLL_MS = 10000;

/**
 * One open conversation: who is in it, what has been said, what is left
 * of today's allowance, and sending.
 */
export const useChatThread = (conversationId) => {
  const queryClient = useQueryClient();
  const enabled = Boolean(conversationId);

  const conversationState = useAsyncResource(
    ["conversations", "detail", conversationId],
    () => conversationApi.getConversation(conversationId),
    { enabled },
  );

  const messagesState = useAsyncResource(
    ["conversations", "messages", conversationId],
    // Newest first from the server, reversed below for display: asking
    // for the newest page is the only way to open a chat at the bottom
    // without walking every page of its history first.
    () => conversationApi.listMessages(conversationId, { limit: WINDOW_SIZE, sortOrder: "desc" }),
    { enabled, refetchInterval: THREAD_POLL_MS },
  );

  const messages = useMemo(() => [...(messagesState.data?.messages ?? [])].reverse(), [messagesState.data]);

  // The allowance the server last told us about. The message list carries
  // it on every poll, so it stays true even when the other tab, or
  // yesterday's midnight, changed it underneath us.
  const quota = messagesState.data?.quota ?? conversationState.data?.conversation?.quota ?? null;

  const refreshBadges = () => {
    // The inbox's own per-thread unread counts. The sidebar dot is a
    // separate mechanism entirely (the "messages" notification module,
    // cleared by visiting the screen) — deliberately not a second count
    // kept here, which could only ever drift from the first.
    queryClient.invalidateQueries({ queryKey: ["conversations", "inbox"] });
  };

  const sendMutation = useAsyncMutation((body) => conversationApi.sendMessage(conversationId, body), {
    onSuccess: async () => {
      await messagesState.refetch();
      refreshBadges();
    },
  });

  /**
   * READING A CHAT MARKS IT READ — but only once per batch of new
   * messages, not on every 10-second poll. The watermark is keyed off the
   * newest message actually on screen: if nothing new has arrived, there
   * is nothing to mark, and firing anyway would put a write on the server
   * every ten seconds for every open chat in the company.
   */
  const newestId = messages.length ? messages[messages.length - 1]._id : "";
  const markedRef = useRef("");

  useEffect(() => {
    if (!conversationId || !newestId) return;
    if (markedRef.current === `${conversationId}:${newestId}`) return;
    markedRef.current = `${conversationId}:${newestId}`;

    conversationApi
      .markRead(conversationId)
      .then(refreshBadges)
      // Housekeeping: a failed watermark means the badge stays up and the
      // next new message tries again. Never worth interrupting someone
      // mid-conversation over.
      .catch(() => {});
    // `refreshBadges` closes over a stable queryClient; re-running this on
    // its identity would defeat the guard above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, newestId]);

  return {
    conversation: conversationState.data?.conversation ?? null,
    messages,
    quota,
    isLoading: conversationState.isLoading || messagesState.isLoading,
    isError: conversationState.isError || messagesState.isError,
    errorMessage: conversationState.errorMessage || messagesState.errorMessage,

    send: sendMutation.mutate,
    isSending: sendMutation.isLoading,
    sendErrorMessage: sendMutation.errorMessage,
  };
};
