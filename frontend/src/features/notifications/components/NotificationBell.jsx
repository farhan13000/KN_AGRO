import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { useNotificationCenter } from "../hooks";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const {
    archive,
    isListError,
    isListLoading,
    isMarkingAllRead,
    listErrorMessage,
    markAllRead,
    markRead,
    notifications,
    unreadCount,
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

  const visibleNotifications = notifications.filter((notification) => !notification.isArchived);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Notifications"
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-muted shadow-sm ring-1 ring-forest/10 transition hover:bg-mint hover:text-forest"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 z-40 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-forest/10 bg-white p-2 shadow-card"
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
            ) : visibleNotifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">You're all caught up — no notifications yet.</p>
            ) : (
              <div className="space-y-1">
                {visibleNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onArchive={archive}
                    onNavigate={() => setOpen(false)}
                    onRead={markRead}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
