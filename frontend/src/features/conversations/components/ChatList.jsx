import { MessageSquarePlus } from "lucide-react";
import Avatar from "../../../shared/components/Avatar";
import { useAuth } from "../../../core/auth";
import { formatInboxTime } from "../utils/chatTime";

/**
 * The threads you already have, newest activity first. A conversation
 * nobody has written in yet sorts to the bottom rather than the top,
 * which is what the backend's null-lastMessageAt ordering already does.
 */
export default function ChatList({ activeConversationId, conversations, onOpenPicker, onSelect }) {
  const { user } = useAuth();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-forest/10 px-4 py-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-muted">Chats</h2>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-forest px-3 py-2 text-xs font-bold text-white transition hover:bg-agriculture"
          data-new-chat
          onClick={onOpenPicker}
          type="button"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" data-chat-list>
        {conversations.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm font-semibold text-muted">
            No chats yet. Start one with anyone on your team, your seniors, or head office.
          </p>
        ) : (
          <ul className="divide-y divide-forest/5">
            {conversations.map((conversation) => {
              const counterpart = (conversation.participants || []).find(
                (participant) => String(participant._id) !== String(user?._id),
              );
              const isActive = String(conversation._id) === String(activeConversationId);
              const unread = conversation.unreadCount || 0;

              return (
                <li key={conversation._id}>
                  <button
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      isActive ? "bg-mint" : "hover:bg-mint/50"
                    }`}
                    data-conversation-id={conversation._id}
                    onClick={() => onSelect(conversation._id)}
                    type="button"
                  >
                    <Avatar name={counterpart?.name || ""} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-black text-ink">
                          {counterpart?.name || "Conversation"}
                        </span>
                        <span className="shrink-0 text-[11px] font-semibold text-soft">
                          {formatInboxTime(conversation.lastMessageAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-xs ${unread ? "font-bold text-ink" : "font-semibold text-muted"}`}
                        >
                          {conversation.lastMessagePreview || "No messages yet"}
                        </span>
                        {/* A real number here, unlike the sidebar's dot:
                            this one counts messages, and a message stays
                            unread until it is actually read. It cannot
                            drift the way a count of pending work can. */}
                        {unread ? (
                          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-forest px-1.5 text-[11px] font-black text-white">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
