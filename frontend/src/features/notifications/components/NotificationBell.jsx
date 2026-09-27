import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { useNotificationCenter } from "../hooks";
import { splitNotifications } from "../utils";
import NotificationGroup from "./NotificationGroup";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const {
    actionRequiredCount,
    archive,
    isListError,
    isListLoading,
    isMarkingAllRead,
    listErrorMessage,
    markAllRead,
    markRead,
    notifications,
    unreadCount,
    unreadNotifications,
  } = useNotificationCenter(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const { actionRequired, activity } = useMemo(
    () =>
      splitNotifications(
        notifications.filter((notification) => !notification.isArchived),
        unreadNotifications.filter((notification) => !notification.isArchived),
      ),
    [notifications, unreadNotifications],
  );
  const hasAnything = actionRequired.length > 0 || activity.length > 0;

  // The number is reserved for things that need a decision. When nothing
  // does but something is new, a plain dot says so without implying a
  // queue of work — a count of 23 read as urgent when none of it was.
  const showCount = actionRequiredCount > 0;
  const showDot = !showCount && unreadCount > 0;
  const bellLabel = showCount
    ? `Notifications, ${actionRequiredCount} need your action`
    : showDot
      ? "Notifications, new activity"
      : "Notifications";

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={bellLabel}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-muted shadow-sm ring-1 ring-forest/10 transition hover:bg-mint hover:text-forest"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Bell className="h-5 w-5" />
        {showCount ? (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white"
          >
            {actionRequiredCount > 99 ? "99+" : actionRequiredCount}
          </span>
        ) : null}
        {showDot ? (
          <span aria-hidden="true" className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
        ) : null}
      </button>

      {open ? (
        // The panel used to hang off the bell, and the bell is not at the
        // right edge of the header — the Profile menu is. Anchored to the
        // button, a 358px panel on a 390px screen started 48px to the
        // LEFT of the screen, so the first column of every notification
        // was cut off. On a phone it now spans the screen with a margin
        // either side; from `sm` up, where it comfortably fits, it goes
        // back to hanging off the bell.
        <div
          className="fixed inset-x-4 top-20 z-40 rounded-2xl border border-forest/10 bg-white p-2 shadow-card sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96"
          role="menu"
        >
          <div className="flex items-center justify-between gap-2 border-b border-forest/10 px-3 py-3">
            <p className="text-sm font-black text-ink">Notifications</p>
            <button
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-forest transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isMarkingAllRead || unreadCount === 0}
              onClick={() => markAllRead()}
              type="button"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto py-2">
            {isListLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : isListError ? (
              <p className="px-3 py-6 text-center text-sm text-red-700">{listErrorMessage || "Unable to load notifications."}</p>
            ) : !hasAnything ? (
              <p className="px-3 py-6 text-center text-sm text-muted">You're all caught up — no notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {actionRequired.length > 0 ? (
                  <section>
                    <div className="flex items-center gap-2 px-3 pb-1">
                      <h3 className="text-[11px] font-black uppercase tracking-wide text-red-800">Needs your action</h3>
                      {/* The server's count, the same number the bell shows.
                          These agree because both count unread action-required
                          items, and the section is drawn from the unread feed
                          rather than from whatever fits in the recent page. */}
                      <span className="rounded-full bg-red-600 px-1.5 text-[10px] font-black text-white">
                        {actionRequiredCount > 99 ? "99+" : actionRequiredCount}
                      </span>
                      {actionRequiredCount > actionRequired.length ? (
                        <span className="text-[10px] font-bold text-muted">showing {actionRequired.length}</span>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      {actionRequired.map((notification) => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          onArchive={archive}
                          onNavigate={() => setOpen(false)}
                          onRead={markRead}
                          variant="action"
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                {activity.length > 0 ? (
                  <section>
                    <h3 className="px-3 pb-1 text-[11px] font-black uppercase tracking-wide text-soft">Activity</h3>
                    <div className="space-y-1">
                      {activity.map((entry) =>
                        entry.kind === "group" ? (
                          <NotificationGroup
                            entry={entry}
                            key={entry.key}
                            onArchive={archive}
                            onNavigate={() => setOpen(false)}
                            onRead={markRead}
                          />
                        ) : (
                          <NotificationItem
                            key={entry.key}
                            notification={entry.notification}
                            onArchive={archive}
                            onNavigate={() => setOpen(false)}
                            onRead={markRead}
                          />
                        ),
                      )}
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
