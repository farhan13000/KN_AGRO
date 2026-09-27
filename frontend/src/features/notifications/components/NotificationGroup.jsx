import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getNotificationTypeMeta } from "../constants";
import { formatBusinessDateTime } from "../../../shared/utils";
import NotificationItem from "./NotificationItem";

/**
 * Several notifications of one kind, shown as a single row until asked
 * otherwise.
 *
 * Expands in place rather than navigating: the individual items still
 * need their own click targets (each goes somewhere different), and
 * keeping it local means the panel needs no idea of which screen a
 * module lives on.
 */
export default function NotificationGroup({ entry, onArchive, onNavigate, onRead }) {
  const [expanded, setExpanded] = useState(false);
  const { icon: TypeIcon, label } = getNotificationTypeMeta(entry.type);
  const count = entry.items.length;

  return (
    <div className="rounded-xl">
      <button
        aria-expanded={expanded}
        className="flex w-full min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-mint"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-forest ring-1 ring-forest/10">
          <TypeIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-ink">{label}</span>
            <span className="shrink-0 rounded-full bg-mint px-2 py-0.5 text-[11px] font-black text-forest">{count}</span>
          </span>
          <span className="mt-1 block text-xs font-semibold text-soft">
            {expanded ? "Tap to collapse" : `${count} updates · latest ${formatBusinessDateTime(entry.sortAt)}`}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded ? (
        <div className="space-y-1 border-l-2 border-forest/10 pl-2">
          {entry.items.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onArchive={onArchive}
              onNavigate={onNavigate}
              onRead={onRead}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
