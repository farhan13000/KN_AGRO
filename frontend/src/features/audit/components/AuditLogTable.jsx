import { formatBusinessDateTime } from "../../../shared/utils";
import { titleCaseAuditValue } from "../constants";
import AuditChangesList from "./AuditChangesList";

export default function AuditLogTable({ logs, onViewDetail }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-forest/10 bg-white shadow-sm">
      <table className="w-full min-w-[880px] divide-y divide-forest/10 text-left text-sm">
        <thead className="text-xs font-black uppercase text-forest">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Entity</th>
            <th className="px-4 py-3">Changes</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-forest/10">
          {logs.map((log) => (
            <tr className="align-top" key={log._id}>
              <td className="whitespace-nowrap px-4 py-3 text-muted">{formatBusinessDateTime(log.createdAt)}</td>
              <td className="px-4 py-3">
                {log.actor ? (
                  <>
                    <p className="font-semibold text-ink">{log.actor.name}</p>
                    <p className="text-xs text-muted">{log.actor.email}</p>
                  </>
                ) : (
                  <span className="text-muted">System</span>
                )}
              </td>
              <td className="px-4 py-3 font-semibold text-ink">{titleCaseAuditValue(log.action)}</td>
              <td className="px-4 py-3 text-muted">
                {log.entityType ? (
                  <>
                    <p>{log.entityType}</p>
                    {log.entityId ? <p className="font-mono text-xs">{log.entityId}</p> : null}
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="min-w-[16rem] max-w-sm px-4 py-3">
                <AuditChangesList changes={log.changes} metadata={log.metadata} />
                {log.description ? <p className="mt-2 text-xs text-muted">{log.description}</p> : null}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <button
                  className="text-xs font-bold text-forest underline-offset-2 hover:underline"
                  onClick={() => onViewDetail(log._id)}
                  type="button"
                >
                  Full record
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
