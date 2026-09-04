import { useState } from "react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import { formatBusinessDateTime } from "../../../shared/utils";
import { titleCaseAuditValue } from "../constants";
import { useAuditLogList } from "../hooks";
import AuditChangesList from "./AuditChangesList";
import AuditLogDetailModal from "./AuditLogDetailModal";

/**
 * Prompt 14.2's entity-scoped "Audit Trail" section — the same list
 * endpoint as the global viewer, filtered to one entityType/entityId, no
 * separate backend call. Used on Employee and District detail pages,
 * which have real per-record frontend routes to attach a section to
 * (see AuditTrailToggle for Promotion/Hiring Request, which don't).
 */
export default function AuditTrailSection({ entityId, entityType, limit = 10 }) {
  const [detailId, setDetailId] = useState(null);
  const { errorMessage, isError, isLoading, logs } = useAuditLogList(
    { entityType, entityId, limit, sortOrder: "desc" },
    { enabled: Boolean(entityType && entityId) },
  );

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">Audit Trail</h2>
      <p className="mt-1 text-sm text-muted">Every audited action recorded against this record, newest first.</p>

      {isLoading ? <p className="mt-4 text-sm font-semibold text-muted">Loading audit trail...</p> : null}
      {isError ? (
        <div className="mt-4">
          <ErrorState message={errorMessage} title="Unable to load audit trail" />
        </div>
      ) : null}
      {!isLoading && !isError && !logs.length ? (
        <div className="mt-4">
          <EmptyState description="No audited actions recorded against this record yet." title="No audit history" />
        </div>
      ) : null}

      {logs.length ? (
        <ul className="mt-4 space-y-3">
          {logs.map((log) => (
            <li className="rounded-lg border border-forest/10 p-3" key={log._id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-ink">{titleCaseAuditValue(log.action)}</p>
                <span className="text-xs font-semibold text-muted">{formatBusinessDateTime(log.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {log.actor ? `${log.actor.name} (${log.actor.email})` : "System"}
              </p>
              <div className="mt-2">
                <AuditChangesList changes={log.changes} metadata={log.metadata} />
              </div>
              {log.description ? <p className="mt-2 text-xs text-muted">{log.description}</p> : null}
              <button
                className="mt-2 text-xs font-bold text-forest underline-offset-2 hover:underline"
                onClick={() => setDetailId(log._id)}
                type="button"
              >
                Full record
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <AuditLogDetailModal auditId={detailId} onClose={() => setDetailId(null)} />
    </section>
  );
}
