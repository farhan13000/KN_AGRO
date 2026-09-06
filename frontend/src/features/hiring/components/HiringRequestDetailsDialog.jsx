import { FileText } from "lucide-react";
import Modal from "../../../shared/components/Modal";
import { HIRING_STATUS_LABELS } from "../constants";
import HiringStatusBadge from "./HiringStatusBadge";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleString();
};

const NOT_SET = "Not specified";

function Field({ children, label }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-wide text-forest">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-ink">{children || NOT_SET}</dd>
    </div>
  );
}

function Section({ children, title }) {
  return (
    <section>
      <h3 className="text-sm font-black uppercase tracking-wide text-agriculture">{title}</h3>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

/**
 * Everything the request actually holds, laid out — the card above it can
 * only afford one truncating line, which is fine for scanning a list and
 * useless for deciding on a person.
 *
 * Read-only, and it renders from the request already in the list: every
 * field below is populated by the list query (see REQUEST_POPULATE in
 * hiring.service.js), so opening this fetches nothing.
 */
export default function HiringRequestDetailsDialog({ isOpen, onClose, request }) {
  if (!request) return null;

  const candidate = request.candidate || {};
  const regions = (request.proposedRegions || []).map((region) => region.name).filter(Boolean);
  const districts = (request.proposedDistricts || []).map((district) => district.name).filter(Boolean);
  const manager = request.proposedManager;
  const createdEmployee = request.createdEmployee;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Candidate details — ${candidate.name || ""}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-black text-ink">{candidate.name || "Unnamed candidate"}</p>
          <HiringStatusBadge status={request.status} />
        </div>

        <Section title="Candidate">
          <Field label="Email">{candidate.email}</Field>
          <Field label="Phone">{candidate.phone}</Field>
          <div className="sm:col-span-2">
            <dt className="text-xs font-black uppercase tracking-wide text-forest">Resume</dt>
            <dd className="mt-1">
              {candidate.resumeUrl ? (
                <a
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-forest underline-offset-2 hover:underline"
                  href={candidate.resumeUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <FileText className="h-4 w-4" />
                  Open resume
                </a>
              ) : (
                <span className="text-sm font-semibold text-ink">No resume attached</span>
              )}
            </dd>
          </div>
        </Section>

        <Section title="Proposed Placement">
          <Field label="Role">{request.proposedRole?.name?.toUpperCase()}</Field>
          <Field label="Reporting Manager">
            {manager?.user?.name
              ? [manager.user.name, manager.employeeCode].filter(Boolean).join(" · ")
              : ""}
          </Field>
          <Field label="Region">{regions.join(", ")}</Field>
          <Field label="District">{districts.join(", ")}</Field>
          <Field label="Department">{request.proposedDepartment}</Field>
          <Field label="Employment Type">{request.proposedEmploymentType}</Field>
        </Section>

        <Section title="Request">
          <Field label="Status">{HIRING_STATUS_LABELS[request.status] || request.status}</Field>
          <Field label="Requested By">{request.requestedBy?.name}</Field>
          <Field label="Requested On">{formatDate(request.createdAt)}</Field>
          <Field label="Decided By">{request.approvedBy?.name}</Field>
          {request.rejectionReason ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-black uppercase tracking-wide text-forest">Rejection Reason</dt>
              <dd className="mt-1 text-sm font-semibold text-red-800">{request.rejectionReason}</dd>
            </div>
          ) : null}
          {createdEmployee ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-black uppercase tracking-wide text-forest">Created Employee</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {[createdEmployee.user?.name, createdEmployee.employeeCode].filter(Boolean).join(" · ")}
              </dd>
            </div>
          ) : null}
        </Section>
      </div>
    </Modal>
  );
}
