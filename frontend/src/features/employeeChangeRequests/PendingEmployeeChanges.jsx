import { useMemo, useState } from "react";
import { CheckCircle2, Undo2 } from "lucide-react";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import EmptyState from "../../shared/components/EmptyState";
import ErrorState from "../../shared/components/ErrorState";
import Modal from "../../shared/components/Modal";
import PageLoader from "../../shared/components/PageLoader";
import Textarea from "../../shared/forms/Textarea";
import { getApiErrorMessage } from "../../core/api";
import { formatBusinessDateTime } from "../../shared/utils";
import { useEmployeeChangeRequestActions, useEmployeeChangeRequests } from "./hooks";

/**
 * Employee edits an Office Admin has proposed, waiting on the owner.
 *
 * Shown as before → after, field by field, because that is the whole
 * question: an approver asked to look at a record and guess what moved
 * is being asked to rubber-stamp. Everything on the row is in words, so
 * "Role: so → asm" reads without knowing the field names underneath.
 *
 * Decided here rather than on the employee page, unlike the quotation
 * gate: a quotation has line items worth opening, while a change request
 * IS its own contents — there is nothing more to see elsewhere.
 */
const PENDING_QUERY = Object.freeze({ page: 1, limit: 50, status: "PENDING", sortOrder: "asc" });

/** Coverage, addresses and photos are objects; the rest read as text. */
const describe = (value) => {
  if (value === null || value === undefined || value === "") return "Not set";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "object") {
    if (Array.isArray(value.states)) {
      const states = value.states.length ? value.states.join(", ") : "No states";
      const districts = (value.districts || []).length ? ` · ${value.districts.length} district(s)` : "";
      const posts = (value.posts || []).length ? ` · ${value.posts.length} post office(s)` : "";
      return `${states}${districts}${posts}`;
    }
    if (value.url) return "A photo";
    const parts = Object.values(value)
      .map((part) => String(part || "").trim())
      .filter(Boolean);
    return parts.length ? parts.join(", ") : "Not set";
  }
  return String(value);
};

function ChangeRow({ change }) {
  return (
    <div className="grid gap-1 border-t border-forest/10 py-3 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr]">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-muted">{change.label}</p>
      <p className="text-sm leading-6 text-ink">
        <span className="text-muted line-through decoration-muted/50">{describe(change.from)}</span>
        <span aria-hidden="true" className="mx-2 text-muted">
          →
        </span>
        <span className="font-bold text-forest">{describe(change.to)}</span>
      </p>
    </div>
  );
}

export default function PendingEmployeeChanges() {
  const query = useMemo(() => ({ ...PENDING_QUERY }), []);
  const state = useEmployeeChangeRequests(query);
  const [sendingBack, setSendingBack] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const actions = useEmployeeChangeRequestActions({
    onSuccess: async () => {
      setSendingBack(null);
      setReason("");
      await state.refetch?.();
    },
  });

  const requests = state.data?.requests || [];

  if (state.isLoading) return <PageLoader message="Loading what is waiting for you..." />;
  if (state.isError) {
    return <ErrorState message={state.errorMessage} title="Unable to load employee changes" />;
  }

  const run = async (requestId, decision, note) => {
    setError("");
    try {
      await actions.decide.mutate(requestId, decision, note);
    } catch (decideError) {
      setError(getApiErrorMessage(decideError));
    }
  };

  if (!requests.length) {
    return (
      <EmptyState
        description="Nothing is waiting on you. Employee changes made by an Office Admin appear here before they take effect."
        title="All clear"
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        // `data-change-request` is the same testing hook the lead
        // requests panel and the printable sheets already use.
        <Card className="p-5" data-change-request={request._id} key={request._id}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h3 className="text-base font-black text-ink">
                {request.employee?.name || request.employee?.employeeCode || "An employee"}
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-muted">
                {[request.employee?.employeeCode, request.employee?.designation].filter(Boolean).join(" · ")}
              </p>
            </div>
            <p className="text-xs font-semibold text-muted">
              Proposed by {request.requestedBy?.name || "Not Set"} · {formatBusinessDateTime(request.requestedAt)}
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-forest/10 bg-white px-4 py-2">
            {(request.fieldChanges || []).map((change) => (
              <ChangeRow change={change} key={change.field} />
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              disabled={actions.decide.isLoading}
              onClick={() => run(request._id, "APPROVED")}
            >
              <CheckCircle2 className="h-4 w-4" />
              {actions.decide.isLoading ? "Working..." : "Approve & apply"}
            </Button>
            <Button
              disabled={actions.decide.isLoading}
              onClick={() => {
                setError("");
                setReason("");
                setSendingBack(request);
              }}
              variant="secondary"
            >
              <Undo2 className="h-4 w-4" />
              Send back
            </Button>
          </div>
        </Card>
      ))}

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Modal isOpen={Boolean(sendingBack)} onClose={() => setSendingBack(null)} title="Send this change back">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            run(sendingBack._id, "REJECTED", reason);
          }}
        >
          <p className="text-sm leading-6 text-muted">
            Say why. {sendingBack?.requestedBy?.name || "Whoever proposed it"} sees your note and works from it, so
            be specific — the wrong role, a district that is not theirs.
          </p>
          <Textarea
            id="employee-change-reason"
            label="What should they change?"
            maxLength={1000}
            onChange={(event) => setReason(event.target.value)}
            required
            value={reason}
          />
          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => setSendingBack(null)} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={actions.decide.isLoading || !reason.trim()} type="submit">
              {actions.decide.isLoading ? "Sending..." : "Send back"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
