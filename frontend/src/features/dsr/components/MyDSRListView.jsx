import { useAuth } from "../../../core/auth";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS } from "../../../shared/constants";
import { useMyDSRList } from "../hooks";
import DSRCard from "./DSRCard";

export default function MyDSRListView({ description, portalLabel, showHeading = true, submitHref }) {
  const { hasPermission } = useAuth();
  const state = useMyDSRList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {showHeading ? (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
            <h1 className="mt-2 text-3xl font-black text-ink">My Daily Sales Reports</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
          </div>
        ) : null}
        {submitHref && hasPermission(PERMISSIONS.DSR_CREATE) ? (
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            href={submitHref}
          >
            Submit DSR
          </a>
        ) : null}
      </div>

      {state.isLoading ? <PageLoader message="Loading your DSRs..." /> : null}
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load your DSRs" /> : null}
      {!state.isLoading && !state.isError && !state.dsrs.length ? (
        <EmptyState description="You haven't submitted a DSR yet." title="No DSRs yet" />
      ) : null}

      {state.dsrs.length ? (
        <ul className="space-y-3">
          {state.dsrs.map((dsr) => (
            <DSRCard dsr={dsr} key={dsr._id} showEmployee={false} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
