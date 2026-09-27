import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState, LoadingSpinner } from "../../../shared/components";
import { useChatInbox } from "../hooks/useChatInbox";
import { useChatThread } from "../hooks/useChatThread";
import ChatList from "../components/ChatList";
import ChatThread from "../components/ChatThread";
import NewChatDialog from "../components/NewChatDialog";

/**
 * THE CHATS SCREEN, shared by all three portals — the portal only
 * supplies where its own chat URLs live (`basePath`), because a Field
 * Officer and a Super Admin need exactly the same screen here. What
 * differs between them is who is in their directory, and that is the
 * server's decision, not this component's.
 *
 * Two panes on a desktop, one at a time on a phone: the conversation id
 * lives in the URL, so the list is what you see without one and the
 * thread is what you see with one. That also makes a chat linkable and
 * the browser's own Back button do the obvious thing.
 *
 * Height is pinned to the viewport rather than left to grow: a chat whose
 * composer sits below the fold, needing a page scroll to reach, is not a
 * chat anyone will use twice.
 */
export default function ChatsWorkspace({ basePath }) {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const inbox = useChatInbox({ directorySearch: search, isPickerOpen });
  const thread = useChatThread(conversationId);

  const openConversation = (id) => navigate(`${basePath}/${id}`);

  const handlePickPerson = async (person) => {
    // Straight to the thread when one already exists — the server would
    // return the same one anyway, but skipping the round trip keeps the
    // picker from feeling like it is thinking about something obvious.
    if (person.conversationId) {
      setIsPickerOpen(false);
      openConversation(person.conversationId);
      return;
    }

    try {
      const result = await inbox.openDirect(person._id);
      const opened = result?.conversation?._id;
      if (opened) {
        setIsPickerOpen(false);
        setSearch("");
        inbox.refetch();
        openConversation(opened);
      }
    } catch {
      // Surfaced by the dialog through inbox.openErrorMessage.
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-0 overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-card">
      <aside
        className={`w-full shrink-0 border-r border-forest/10 lg:flex lg:w-80 ${
          conversationId ? "hidden lg:block" : "block"
        }`}
      >
        {inbox.isError ? (
          <ErrorState message={inbox.errorMessage} />
        ) : inbox.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <ChatList
            activeConversationId={conversationId}
            conversations={inbox.conversations}
            onOpenPicker={() => setIsPickerOpen(true)}
            onSelect={openConversation}
          />
        )}
      </aside>

      <div className={`min-w-0 flex-1 ${conversationId ? "block" : "hidden lg:block"}`}>
        {conversationId ? (
          <ChatThread
            conversation={thread.conversation}
            errorMessage={thread.errorMessage}
            isError={thread.isError}
            isLoading={thread.isLoading}
            isSending={thread.isSending}
            messages={thread.messages}
            onBack={() => navigate(basePath)}
            quota={thread.quota}
            send={thread.send}
            sendErrorMessage={thread.sendErrorMessage}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-black text-ink">Pick a chat to open it</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
              Short messages only — the day&apos;s allowance per chat is small on purpose. For anything longer, call
              or WhatsApp.
            </p>
          </div>
        )}
      </div>

      <NewChatDialog
        errorMessage={inbox.directoryErrorMessage || inbox.openErrorMessage}
        isLoading={inbox.isDirectoryLoading}
        isOpen={isPickerOpen}
        isOpening={inbox.isOpening}
        onClose={() => setIsPickerOpen(false)}
        onSearchChange={setSearch}
        onSelect={handlePickPerson}
        people={inbox.people}
        search={search}
      />
    </div>
  );
}
