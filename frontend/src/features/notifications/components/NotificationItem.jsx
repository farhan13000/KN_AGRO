import { Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatBusinessDateTime } from "../../../shared/utils";
import { useAuth } from "../../../core/auth";
import { getNotificationTypeMeta, SEVERITY_TONE } from "../constants";
import { resolveNotificationRoute } from "../utils";

export default function NotificationItem({ notification, onArchive, onNavigate, onRead, variant = "default" }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { icon: TypeIcon, label } = getNotificationTypeMeta(notification.type);
  const destination = resolveNotificationRoute(notification, role);

  const handleClick = () => {
    if (!notification.isRead) onRead(notification._id);
    if (destination) {
      onNavigate?.();
      navigate(destination);
    }
  };

  const handleArchive = (event) => {
    event.stopPropagation();
    onArchive(notification._id);
  };

  // The action variant is the whole point of the split: a red left edge
  // and a warm tint make "this is waiting on you" readable at a glance,
  // without relying on colour alone — it also sits under its own heading
  // and carries an explicit action button below.
  const isAction = variant === "action";
  // Clicking has to do SOMETHING even with nowhere to go: a few
  // notification types carry no actionKey, and when one of those is
  // unread it would otherwise be permanently stuck in "needs your
  // action" with no way to clear it. Here the click still marks it read.
  const isInteractive = Boolean(destination) || !notification.isRead;
  const toneClass = isAction
    ? "border-l-4 border-red-600 bg-red-50/70 hover:bg-red-50"
    : `${notification.isRead ? "bg-white" : "bg-mint/60"} ${isInteractive ? "hover:bg-mint" : ""}`;

  return (
    <div
      className={`group relative flex gap-3 rounded-xl px-3 py-3 text-left transition ${toneClass} ${
        isInteractive ? "cursor-pointer" : ""
      }`}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {!notification.isRead ? (
        <span aria-label="Unread" className="absolute left-1 top-4 h-2 w-2 rounded-full bg-agriculture" />
      ) : null}
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-forest ring-1 ring-forest/10">
        <TypeIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-ink">{notification.title}</p>
          <StatusBadge tone={SEVERITY_TONE[notification.severity] || "neutral"}>{label}</StatusBadge>
        </div>
        <p className="mt-1 text-sm text-muted">{notification.message}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-soft">{formatBusinessDateTime(notification.createdAt)}</span>
          <div className="flex items-center gap-1">
            {isAction && destination ? (
              <span className="inline-flex min-h-8 items-center rounded-lg bg-forest px-3 py-1 text-xs font-black text-white">
                Review
              </span>
            ) : null}
            {!notification.isArchived ? (
              <button
                aria-label="Archive notification"
                // Hover-reveal never worked on touch, where there is no
                // hover — the archive action was simply unreachable on a
                // phone. Always visible below `sm`, hover-revealed above.
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-forest sm:invisible sm:h-7 sm:w-7 sm:group-hover:visible"
                onClick={handleArchive}
                type="button"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
