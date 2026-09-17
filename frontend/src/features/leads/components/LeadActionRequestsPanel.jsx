import { useCallback, useState } from "react";
import { BellRing, Check, X } from "lucide-react";
import Card from "../../../shared/components/Card";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import { PERMISSIONS } from "../../../shared/constants";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { formatBusinessDateTime } from "../../../shared/utils";
import { leadActionRequestApi } from "../services/leadActionRequestApi";

const REQUEST_TYPES = [
  { value: "CREATE_QUOTATION", label: "Create quotation" },
  { value: "CONFIRM_ORDER", label: "Confirm order" },
  { value: "CREATE_INVOICE", label: "Create bill" },
  { value: "RECORD_PAYMENT", label: "Record payment" },
];

const VIA_LABELS = {
  MANUAL: "marked done",
  QUOTATION_CREATED: "quotation created",
  ORDER_CONFIRMED: "order confirmed",
  INVOICE_CREATED: "bill created",
  PAYMENT_RECORDED: "payment recorded",
};

const secondaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50";

/**
 * "Ask your manager" on a lead. Field staff (SO/FO) send one of four
 * requests; the ASM/RM/GM above them is notified. A pending request shows
 * here (and as a red dot in the leads list) until the manager does the
 * task — doing the real action (creating the quotation, confirming the
 * order, making the bill, recording the payment) closes it by itself, or
 * they can mark it done.
 */
export default function LeadActionRequestsPanel({ lead }) {
  const { hasPermission, user } = useAuth();
  // ASM/RM/GM and SA/OA can do these tasks themselves; SO/FO ask for them.
  const canAct = hasPermission(PERMISSIONS.ORDERS_CONFIRM);
  const myUserId = user?._id || user?.id;

  const request = useCallback(() => leadActionRequestApi.list({ leadId: lead._id }), [lead._id]);
  const state = useAsyncResource(["lead-action-requests", lead._id], request, { enabled: Boolean(lead?._id) });
  const requests = state.data?.requests || [];
  const pending = requests.filter((item) => item.status === "PENDING");
  const history = requests.filter((item) => item.status !== "PENDING").slice(0, 5);
  const pendingTypes = new Set(pending.map((item) => item.type));

  const [asking, setAsking] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const refresh = () => state.refetch?.();
  const createRequest = useAsyncMutation((payload) => leadActionRequestApi.create(payload), { onSuccess: refresh });
  const completeRequest = useAsyncMutation((id) => leadActionRequestApi.complete(id), { onSuccess: refresh });
  const cancelRequest = useAsyncMutation((id) => leadActionRequestApi.cancel(id), { onSuccess: refresh });

  const run = async (mutation, ...args) => {
    setError("");
    try {
      await mutation.mutate(...args);
      return true;
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError));
      return false;
    }
  };

  const send = async () => {
    if (await run(createRequest, { leadId: lead._id, type: asking.value, note: note.trim() })) {
      setAsking(null);
      setNote("");
    }
  };

  if (!canAct && !requests.length && state.isLoading) return null;

  return (
    <Card className="p-5" data-lead-requests>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-ink">
          {pending.length ? <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-red-600" /> : null}
          {canAct ? "Requests from the team" : "Ask your manager"}
          {pending.length ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-black text-red-700">{pending.length} pending</span>
          ) : null}
        </h2>
      </div>

      {!canAct ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {REQUEST_TYPES.map((type) => (
            <button
              className={secondaryButton}
              disabled={pendingTypes.has(type.value)}
              key={type.value}
              onClick={() => {
                setError("");
                setNote("");
                setAsking(type);
              }}
              title={pendingTypes.has(type.value) ? "Already requested — waiting for your manager" : undefined}
              type="button"
            >
              <BellRing className="h-4 w-4" />
              {type.label}
            </button>
          ))}
        </div>
      ) : null}

      {pending.length ? (
        <ul className="mt-4 space-y-2">
          {pending.map((item) => (
            <li className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50/60 p-3" key={item._id}>
              <div className="min-w-0">
                <p className="text-sm font-black text-ink">{item.label}</p>
                <p className="text-xs text-muted">
                  {item.requestedBy?.name || "Someone"} · {formatBusinessDateTime(item.createdAt)}
                  {item.assignedTo?.name ? ` · for ${item.assignedTo.name}` : ""}
                </p>
                {item.note ? <p className="mt-1 text-sm text-ink">“{item.note}”</p> : null}
              </div>
              <div className="flex gap-2">
                {canAct && String(item.requestedBy?._id) !== String(myUserId) ? (
                  <button className={secondaryButton} onClick={() => run(completeRequest, item._id)} type="button">
                    <Check className="h-4 w-4" />
                    Mark done
                  </button>
                ) : null}
                {String(item.requestedBy?._id) === String(myUserId) ? (
                  <button className={secondaryButton} onClick={() => run(cancelRequest, item._id)} type="button">
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : canAct ? (
        <p className="mt-3 text-sm text-muted">No pending requests on this lead.</p>
      ) : null}

      {history.length ? (
        <ul className="mt-4 space-y-1 text-xs text-muted">
          {history.map((item) => (
            <li key={item._id}>
              <span className="font-bold text-ink">{item.label}</span> ·{" "}
              {item.status === "COMPLETED"
                ? `done by ${item.completedBy?.name || "manager"} (${VIA_LABELS[item.completedVia] || "done"}) ${formatBusinessDateTime(item.completedAt)}`
                : "cancelled"}
            </li>
          ))}
        </ul>
      ) : null}

      {error && !asking ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <Modal isOpen={Boolean(asking)} onClose={() => setAsking(null)} title={asking ? `Request: ${asking.label}` : ""}>
        <div className="space-y-4">
          <p className="text-sm text-muted">Your manager gets a notification. The request stays open until they do it.</p>
          <Textarea
            id="lead-request-note"
            label="Note for your manager (optional)"
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            value={note}
          />
          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <button className={secondaryButton} onClick={() => setAsking(null)} type="button">
              Cancel
            </button>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-forest px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
              disabled={createRequest.isLoading}
              onClick={send}
              type="button"
            >
              {createRequest.isLoading ? "Sending…" : "Send request"}
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
