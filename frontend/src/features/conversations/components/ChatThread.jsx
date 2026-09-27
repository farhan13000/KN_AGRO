import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, Phone, Send } from "lucide-react";
import Avatar from "../../../shared/components/Avatar";
import { ErrorState, LoadingSpinner } from "../../../shared/components";
import { useAuth } from "../../../core/auth";
import { buildCallLink, buildWhatsAppLink } from "../constants";
import { formatChatTime, groupMessagesByDay } from "../utils/chatTime";

/**
 * How close to the bottom still counts as "reading the latest". Someone
 * who has scrolled up to re-read something must not be yanked back down
 * by a poll landing a new message.
 */
const STICK_TO_BOTTOM_PX = 120;

function DaySeparator({ label }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-forest/10" />
      <span className="rounded-full bg-mint px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">
        {label}
      </span>
      <span className="h-px flex-1 bg-forest/10" />
    </div>
  );
}

function MessageBubble({ isMine, message }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`} data-message-id={message._id}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm sm:max-w-[70%] ${
          isMine ? "bg-forest text-white" : "bg-white text-ink ring-1 ring-forest/10"
        }`}
      >
        {/* whitespace-pre-wrap, so a message typed across three lines
            arrives as three lines. break-words, so a pasted URL or an
            unbroken string of digits cannot push the bubble off screen. */}
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className={`mt-1 text-right text-[11px] font-semibold ${isMine ? "text-white/70" : "text-soft"}`}>
          {formatChatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

/**
 * WHAT SHOWS WHEN TODAY'S MESSAGES ARE SPENT.
 *
 * Deliberately not an error. Nothing has gone wrong — the cap did exactly
 * what it is for, which is to move a long exchange onto a call. So it
 * reads as a hand-off, and it carries the two buttons that make the
 * hand-off real. Without a number to call it says so plainly rather than
 * offering a dead button.
 */
function QuotaReachedPanel({ counterpart, resetsAt }) {
  const call = buildCallLink(counterpart?.phone);
  const whatsApp = buildWhatsAppLink(counterpart?.phone);
  const name = counterpart?.name || "them";

  return (
    <div className="rounded-2xl border border-mustard/50 bg-mustard/10 p-4" data-quota-reached>
      <p className="text-sm font-black text-ink">Today&apos;s messages in this chat are used up</p>
      <p className="mt-1 text-sm leading-6 text-muted">
        {call || whatsApp
          ? `For anything more today, call or WhatsApp ${name} on ${counterpart.phone}.`
          : `For anything more today, please call ${name} directly.`}
        {resetsAt ? " You can message here again tomorrow." : ""}
      </p>
      {call || whatsApp ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {call ? (
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest px-4 py-2 text-sm font-bold text-white transition hover:bg-agriculture"
              href={call}
            >
              <Phone className="h-4 w-4" />
              Call {name.split(" ")[0]}
            </a>
          ) : null}
          {whatsApp ? (
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition hover:brightness-95"
              href={whatsApp}
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function ChatThread({ conversation, errorMessage, isError, isLoading, messages, onBack, quota, send, isSending, sendErrorMessage }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const counterpart = (conversation?.participants || []).find(
    (participant) => String(participant._id) !== String(user?._id),
  );

  // Scrolls to the newest message, but only for someone who was already
  // at the bottom — see STICK_TO_BOTTOM_PX.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !stickToBottomRef.current) return;
    // Next frame, not this one: the footer swaps between a composer and
    // the taller "allowance spent" panel, and scrolling before that has
    // been laid out leaves the newest message hidden behind it.
    const frame = requestAnimationFrame(() => {
      if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, quota?.remaining]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distanceFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    stickToBottomRef.current = distanceFromBottom <= STICK_TO_BOTTOM_PX;
  };

  const remaining = quota?.remaining ?? null;
  const isLocked = remaining === 0;

  const handleSend = async (event) => {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || isSending || isLocked) return;

    try {
      await send(body);
      setDraft("");
      stickToBottomRef.current = true;
    } catch {
      // The failure is already on screen via sendErrorMessage, and the
      // draft is deliberately kept — losing what someone typed because
      // the network blinked is the worst thing this screen could do.
    }
  };

  // Enter sends; Shift+Enter is a new line. The same bargain every
  // messaging app makes, and the one people's hands already expect.
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (isError) return <ErrorState message={errorMessage} />;
  if (isLoading && !conversation) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <LoadingSpinner />
      </div>
    );
  }

  const call = buildCallLink(counterpart?.phone);
  const whatsApp = buildWhatsAppLink(counterpart?.phone);

  return (
    <section className="flex h-full min-h-0 flex-col" data-chat-thread>
      <header className="flex items-center gap-3 border-b border-forest/10 bg-white px-4 py-3">
        <button
          aria-label="Back to chats"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-mint hover:text-forest lg:hidden"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={counterpart?.name || ""} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-ink">{counterpart?.name || "Conversation"}</p>
          <p className="truncate text-xs font-semibold text-muted">
            {[counterpart?.designation, counterpart?.employeeCode].filter(Boolean).join(" · ") || counterpart?.email}
          </p>
        </div>
        {/* Always here, not only once the cap is hit: a call is often the
            right move on the first message, never mind the fifteenth. */}
        {call ? (
          <a
            aria-label={`Call ${counterpart?.name || "this person"}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            href={call}
          >
            <Phone className="h-4 w-4" />
          </a>
        ) : null}
        {whatsApp ? (
          <a
            aria-label={`WhatsApp ${counterpart?.name || "this person"}`}
            className="inline-flex h-10 items-center justify-center rounded-xl px-2.5 text-xs font-bold text-[#128C7E] ring-1 ring-[#25D366]/40 transition hover:bg-[#25D366]/10 sm:px-3"
            href={whatsApp}
            rel="noreferrer"
            target="_blank"
          >
            {/* The word costs about 70px, which on a 390px screen is the
                difference between reading the person's name and reading
                "Firoz Al...". The icon says the same thing there. */}
            <MessageCircle aria-hidden="true" className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-ivory px-4 py-4" onScroll={handleScroll} ref={scrollerRef}>
        {/* justify-end on a min-h-full column: a short conversation sits
            at the BOTTOM of the pane, against the composer, the way every
            chat anyone has used behaves — rather than stranded at the top
            with a field of empty space beneath it. Once the messages
            outgrow the pane this has no effect and it scrolls normally. */}
        <div className="flex min-h-full flex-col justify-end">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-muted">
            No messages yet. Say what you need — keep it short, and ring them for anything longer.
          </p>
        ) : (
          groupMessagesByDay(messages).map((group) => (
            <div key={group.key}>
              <DaySeparator label={group.day} />
              <div className="space-y-2">
                {group.messages.map((message) => (
                  <MessageBubble
                    isMine={String(message.sender?._id ?? message.sender) === String(user?._id)}
                    key={message._id}
                    message={message}
                  />
                ))}
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      <footer className="border-t border-forest/10 bg-white px-4 py-3">
        {sendErrorMessage ? (
          <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{sendErrorMessage}</p>
        ) : null}

        {isLocked ? (
          <QuotaReachedPanel counterpart={counterpart} resetsAt={quota?.resetsAt} />
        ) : (
          <form className="flex items-end gap-2" onSubmit={handleSend}>
            <textarea
              aria-label="Message"
              className="min-h-11 flex-1 resize-none rounded-xl border border-forest/15 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-forest"
              maxLength={4000}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a short message..."
              rows={1}
              value={draft}
            />
            <button
              aria-label="Send message"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest text-white transition hover:bg-agriculture disabled:opacity-50"
              disabled={!draft.trim() || isSending}
              type="submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* The count is shown from the start, not sprung on someone at
            zero. Amber for the last few, so running low is visible before
            it is a wall. */}
        {quota && !isLocked ? (
          <p
            className={`mt-2 text-xs font-bold ${remaining <= 3 ? "text-amber-700" : "text-soft"}`}
            data-quota-remaining={remaining}
          >
            {remaining} of {quota.limit} messages left today in this chat
            {remaining <= 3 ? " — call or WhatsApp for anything longer." : "."}
          </p>
        ) : null}
      </footer>
    </section>
  );
}
