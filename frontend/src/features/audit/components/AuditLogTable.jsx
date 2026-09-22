import { DataTable } from "../../../shared/components";
import { formatBusinessDateTime } from "../../../shared/utils";
import { titleCaseAuditValue } from "../constants";
import AuditChangesList from "./AuditChangesList";

export default function AuditLogTable({ logs, onViewDetail }) {
  const columns = [
    {
      key: "createdAt",
      header: "When",
      cellClassName: "whitespace-nowrap text-muted",
      cell: (log) => formatBusinessDateTime(log.createdAt),
    },
    {
      key: "actor",
      header: "Actor",
      role: "title",
      cell: (log) =>
        log.actor ? (
          <>
            <p className="font-semibold text-ink">{log.actor.name}</p>
            <p className="text-xs text-muted">{log.actor.email}</p>
          </>
        ) : (
          <span className="text-muted">System</span>
        ),
    },
    {
      key: "action",
      header: "Action",
      cellClassName: "font-semibold text-ink",
      cell: (log) => titleCaseAuditValue(log.action),
    },
    {
      key: "entity",
      header: "Entity",
      cellClassName: "text-muted",
      cell: (log) =>
        log.entityType ? (
          <>
            <p>{log.entityType}</p>
            {log.entityId ? <p className="break-all font-mono text-xs">{log.entityId}</p> : null}
          </>
        ) : (
          "—"
        ),
    },
    {
      key: "changes",
      header: "Changes",
      cellClassName: "min-w-[16rem] max-w-sm",
      // A change list is a block of its own; squeezed into one half of the
      // card's two-column field grid it becomes unreadable, so it spans
      // the full width there.
      cardClassName: "col-span-2",
      cell: (log) => (
        <>
          <AuditChangesList changes={log.changes} metadata={log.metadata} />
          {log.description ? <p className="mt-2 text-xs text-muted">{log.description}</p> : null}
        </>
      ),
    },
    {
      key: "actions",
      header: "Full record",
      role: "actions",
      cellClassName: "whitespace-nowrap",
      cell: (log) => (
        <button
          className="inline-flex min-h-11 items-center text-xs font-bold text-forest underline-offset-2 hover:underline md:min-h-0"
          onClick={() => onViewDetail(log._id)}
          type="button"
        >
          Full record
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      minWidth="880px"
      rows={logs}
      theadClassName="text-xs font-black uppercase text-forest"
    />
  );
}
