import { useState } from "react";
import { Lock, UserCheck } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { API_ENDPOINTS, apiClient, getApiErrorMessage } from "../../../core/api";
import { formatBusinessDateTime } from "../../../shared/utils";

const HANDLER_ROLES = ["asm", "rm", "gm"];
const ADMIN_ROLES = ["sa", "oa"];

/**
 * Which manager is handling this lead. The first ASM/RM/GM to work on a
 * lead becomes its handler; after that only they can change it. Another
 * manager sees that it is locked and by whom; SA/OA can release it.
 */
export default function LeadHandlerBanner({ lead, onChanged }) {
  const { role, user } = useAuth();
  const [error, setError] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const handler = lead?.handledBy;
  const myUserId = user?._id || user?.id;
  const isAdmin = ADMIN_ROLES.includes(role);

  if (!handler) {
    if (!HANDLER_ROLES.includes(role)) return null;
    return (
      <p className="rounded-lg border border-forest/10 bg-mint/40 px-4 py-3 text-sm text-muted" data-lead-handler="none">
        No manager is handling this lead yet. The first ASM/RM/GM to work on it (quotation, order, bill, edit…) takes it.
      </p>
    );
  }

  const isMine = String(handler.userId) === String(myUserId);
  const lockedForMe = HANDLER_ROLES.includes(role) && !isMine;

  const release = async () => {
    setIsReleasing(true);
    setError("");
    try {
      await apiClient.patch(API_ENDPOINTS.LEAD_HANDLERS.RELEASE(lead._id));
      await onChanged?.();
    } catch (releaseError) {
      setError(getApiErrorMessage(releaseError));
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
        lockedForMe ? "border-amber-200 bg-amber-50 text-amber-900" : "border-forest/15 bg-mint/40 text-ink"
      }`}
      data-lead-handler={lockedForMe ? "locked" : isMine ? "mine" : "other"}
    >
      <p className="flex items-center gap-2">
        {lockedForMe ? <Lock className="h-4 w-4 shrink-0" /> : <UserCheck className="h-4 w-4 shrink-0 text-forest" />}
        <span>
          {isMine ? (
            <b>You are handling this lead</b>
          ) : (
            <>
              Handled by <b>{handler.name}</b>
              {handler.roleLabel ? ` (${handler.roleLabel})` : ""}
            </>
          )}
          {lead.handledAt ? ` since ${formatBusinessDateTime(lead.handledAt)}` : ""}.
          {lockedForMe ? " Only they can make changes to it." : ""}
        </span>
      </p>
      {isAdmin ? (
        <button
          className="inline-flex min-h-9 items-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:opacity-60"
          disabled={isReleasing}
          onClick={release}
          type="button"
        >
          {isReleasing ? "Releasing…" : "Release lead"}
        </button>
      ) : null}
      {error ? <p className="w-full text-xs font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
