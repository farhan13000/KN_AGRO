import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import Modal from "../../../shared/components/Modal";
import { formatBusinessDateTime } from "../../../shared/utils";
import { useAuditLogDetail } from "../hooks";
import { titleCaseAuditValue } from "../constants";
import AuditChangesList from "./AuditChangesList";

const KeyValue = ({ label, value }) => (
  <div>
    <dt className="text-xs font-black uppercase tracking-wide text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-ink">{value || "—"}</dd>
  </div>
);

const JsonBlock = ({ label, value }) => {
  if (!value || (typeof value === "object" && Object.keys(value).length === 0)) return null;
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-muted">{label}</p>
      <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-mint/40 p-3 text-xs text-ink">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
};

// The opt-in "full record" view — before/after/metadata as raw JSON is
// appropriate HERE (a deliberate drill-down a user asked for by clicking
// "View full record"), unlike AuditChangesList's default row rendering,
// which never dumps raw JSON at a glance across many rows.
export default function AuditLogDetailModal({ auditId, onClose }) {
  const { errorMessage, isError, isLoading, log } = useAuditLogDetail(auditId, { enabled: Boolean(auditId) });

  return (
    <Modal isOpen={Boolean(auditId)} onClose={onClose} title="Audit Log Entry">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-700">{errorMessage || "Unable to load this audit entry."}</p>
      ) : log ? (
        <div className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <KeyValue label="Action" value={titleCaseAuditValue(log.action)} />
            <KeyValue label="When" value={formatBusinessDateTime(log.createdAt)} />
            <KeyValue label="Actor" value={log.actor ? `${log.actor.name} (${log.actor.email})` : "System"} />
            <KeyValue
              label="Actor Employee"
              value={log.actorEmployee ? `${log.actorEmployee.employeeCode} — ${log.actorEmployee.designation}` : "—"}
            />
            <KeyValue label="Entity Type" value={log.entityType} />
            <KeyValue label="Entity Id" value={log.entityId} />
            <KeyValue label="IP Address" value={log.ipAddress} />
            <KeyValue label="Request Id" value={log.requestId} />
          </dl>

          {log.description ? (
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-muted">Description</p>
              <p className="mt-1 text-sm text-ink">{log.description}</p>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-black uppercase tracking-wide text-muted">Changes</p>
            <div className="mt-1">
              <AuditChangesList changes={log.changes} metadata={log.metadata} />
            </div>
          </div>

          <JsonBlock label="Before (raw)" value={log.before} />
          <JsonBlock label="After (raw)" value={log.after} />
          <JsonBlock label="Metadata (raw)" value={log.metadata} />
        </div>
      ) : null}
    </Modal>
  );
}
