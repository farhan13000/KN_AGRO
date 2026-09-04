import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatBusinessDateTime } from "../../../shared/utils";
import { titleCaseAuditValue } from "../constants";
import { useAuditLogList } from "../hooks";
import AuditChangesList from "./AuditChangesList";

/**
 * A collapsed-by-default inline audit trail for entities with no
 * dedicated frontend detail page of their own (Promotion, Hiring
 * Request — only a list/pipeline card, per Frontend Phase F13's own
 * finding that neither has a per-record route). Fetches only once
 * expanded (`enabled: open`), not for every card on the page up front.
 */
export default function AuditTrailToggle({ entityId, entityType }) {
  const [open, setOpen] = useState(false);
  const { errorMessage, isError, isLoading, logs } = useAuditLogList(
    { entityType, entityId, limit: 10, sortOrder: "desc" },
    { enabled: open && Boolean(entityType && entityId) },
  );

  return (
    <div className="mt-3 border-t border-forest/10 pt-3">
      <button
        className="inline-flex items-center gap-1 text-xs font-bold text-forest"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        Audit trail
      </button>

      {open ? (
        <div className="mt-2 space-y-2">
          {isLoading ? <p className="text-xs font-semibold text-muted">Loading audit trail...</p> : null}
          {isError ? <p className="text-xs font-semibold text-red-700">{errorMessage || "Unable to load audit trail."}</p> : null}
          {!isLoading && !isError && !logs.length ? (
            <p className="text-xs text-muted">No audited actions recorded for this record yet.</p>
          ) : null}
          {logs.map((log) => (
            <div className="rounded-lg bg-mint/40 p-2.5" key={log._id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-ink">{titleCaseAuditValue(log.action)}</p>
                <span className="text-xs text-muted">{formatBusinessDateTime(log.createdAt)}</span>
              </div>
              <p className="text-xs text-muted">{log.actor ? log.actor.name : "System"}</p>
              <div className="mt-1">
                <AuditChangesList changes={log.changes} metadata={log.metadata} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
