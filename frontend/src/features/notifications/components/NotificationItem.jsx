import { Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatBusinessDateTime } from "../../../shared/utils";
import { useAuth } from "../../../core/auth";
import { getNotificationTypeMeta, SEVERITY_TONE } from "../constants";
import { resolveNotificationRoute } from "../utils";

export default function NotificationItem({ notification, onArchive, onNavigate, onRead }) {
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

  return (
    <div
      className={`group relative flex gap-3 rounded-xl px-3 py-3 text-left transition ${
        notification.isRead ? "bg-white" : "bg-mint/60"
      } ${destination ? "cursor-pointer hover:bg-mint" : ""}`}
      onClick={destination ? handleClick : undefined}
      role={destination ? "button" : undefined}
      tabIndex={destination ? 0 : undefined}
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
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-soft">{formatBusinessDateTime(notification.createdAt)}</span>
          {!notification.isArchived ? (
            <button
              aria-label="Archive notification"
              className="invisible flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-forest group-hover:visible"
              onClick={handleArchive}
              type="button"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
