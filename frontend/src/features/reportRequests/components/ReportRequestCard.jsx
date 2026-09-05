import { REPORT_PRIORITY_LABELS, REPORT_STATUS, REPORT_TYPE_LABELS } from "../constants";
import ReportRequestStatusBadge from "./ReportRequestStatusBadge";

const formatDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString();
};

const employeeName = (employee) => employee?.user?.name || employee?.employeeCode || "Unknown";

export default function ReportRequestCard({ actions = null, reportRequest, showAssignedTo = false }) {
  return (
    <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {showAssignedTo ? (
            <p className="text-sm font-black text-ink">{employeeName(reportRequest.assignedTo)}</p>
          ) : null}
          <p className="mt-1 text-sm font-semibold text-ink">{reportRequest.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
            <span>{REPORT_TYPE_LABELS[reportRequest.type] || reportRequest.type}</span>
            <span>· {REPORT_PRIORITY_LABELS[reportRequest.priority] || reportRequest.priority} priority</span>
            {formatDate(reportRequest.dueDate) ? <span>· Due {formatDate(reportRequest.dueDate)}</span> : null}
          </p>
        </div>
        <ReportRequestStatusBadge status={reportRequest.status} />
      </div>

      {reportRequest.description ? <p className="mt-3 text-sm text-muted">{reportRequest.description}</p> : null}

      {reportRequest.submissionText ? (
        <p className="mt-3 text-sm text-muted">
          <span className="text-xs font-black uppercase tracking-wide text-muted">Submission</span>{" "}
          {reportRequest.submissionText}
        </p>
      ) : null}

      {reportRequest.attachments?.length ? (
        <ul className="mt-2 space-y-1">
          {reportRequest.attachments.map((attachment, index) => (
            <li key={index}>
              <a
                className="text-xs font-bold text-forest underline-offset-2 hover:underline"
                href={attachment.url}
                rel="noreferrer"
                target="_blank"
              >
                {attachment.name || attachment.url}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {reportRequest.status === REPORT_STATUS.REVIEWED && reportRequest.reviewComment ? (
        <p className="mt-2 text-sm text-muted">
          <span className="text-xs font-black uppercase tracking-wide text-muted">Review Comment</span>{" "}
          {reportRequest.reviewComment}
        </p>
      ) : null}

      {reportRequest.status === REPORT_STATUS.REJECTED && reportRequest.rejectionReason ? (
        <p className="mt-2 text-sm text-red-800">
          <span className="text-xs font-black uppercase tracking-wide">Rejected</span>{" "}
          {reportRequest.rejectionReason}
        </p>
      ) : null}

      {actions ? <div className="mt-4 flex flex-wrap gap-3">{actions}</div> : null}
    </li>
  );
}
