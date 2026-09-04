import { ArrowRight } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import { useEmployeeTransfers } from "../hooks";

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleDateString();
};

/**
 * One from -> to line. A transfer only carries the fields it actually
 * changed, so a pair where both sides are empty is skipped entirely
 * rather than rendered as "none -> none".
 */
function ChangeRow({ from, label, to }) {
  if (!from && !to) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-xs font-black uppercase tracking-wide text-muted">{label}</span>
      <span className="text-ink">{from || "Not set"}</span>
      <ArrowRight aria-hidden="true" className="h-4 w-4 text-agriculture" />
      <span className="font-semibold text-ink">{to || "Cleared"}</span>
    </div>
  );
}

const managerLabel = (manager) => manager?.employeeCode || "";
const namedLabel = (entity) => (entity?.name ? `${entity.name} (${entity.code})` : "");
const roleLabel = (role) => (role?.name ? role.name.toUpperCase() : "");

export default function TransferHistoryList({ employeeId }) {
  const transfersState = useEmployeeTransfers(employeeId);
  const transfers = transfersState.data?.transfers || [];

  if (transfersState.isError) {
    return <ErrorState message={transfersState.errorMessage} title="Unable to load transfer history" />;
  }

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">Transfer History</h2>
      <p className="mt-1 text-sm text-muted">
        Every organizational change to this employee, newest first. These records are permanent and
        never edited.
      </p>

      {transfersState.isLoading ? (
        <p className="mt-4 text-sm font-semibold text-muted">Loading transfer history...</p>
      ) : null}

      {!transfersState.isLoading && !transfers.length ? (
        <div className="mt-4">
          <EmptyState
            description="This employee has not been transferred yet."
            title="No transfers recorded"
          />
        </div>
      ) : null}

      {transfers.length ? (
        <ol className="mt-5 space-y-4">
          {transfers.map((transfer) => (
            <li className="rounded-lg border border-forest/10 bg-mint/30 p-4" key={transfer._id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-black text-forest">
                  Effective {formatDate(transfer.effectiveAt)}
                </p>
                <p className="text-xs font-semibold text-muted">
                  By {transfer.transferredBy?.name || "Unknown"} on {formatDate(transfer.createdAt)}
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <ChangeRow
                  from={managerLabel(transfer.fromManager)}
                  label="Manager"
                  to={managerLabel(transfer.toManager)}
                />
                <ChangeRow
                  from={namedLabel(transfer.fromRegion)}
                  label="Region"
                  to={namedLabel(transfer.toRegion)}
                />
                <ChangeRow
                  from={namedLabel(transfer.fromDistrict)}
                  label="District"
                  to={namedLabel(transfer.toDistrict)}
                />
                <ChangeRow
                  from={roleLabel(transfer.fromRole)}
                  label="Role"
                  to={roleLabel(transfer.toRole)}
                />
              </div>

              <p className="mt-3 text-sm text-muted">
                <span className="text-xs font-black uppercase tracking-wide text-muted">Reason</span>{" "}
                {transfer.reason}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
