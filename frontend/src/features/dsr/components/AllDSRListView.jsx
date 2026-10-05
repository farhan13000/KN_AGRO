import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useAllDSRList } from "../hooks";
import DSRCard from "./DSRCard";

/**
 * `showHeading` is false when this view is one tab inside a
 * TabbedWorkspace, which already prints the title and the blurb — same
 * prop the other list views in this feature take for the same reason.
 */
export default function AllDSRListView({ description, portalLabel, printRoute, showHeading = true }) {
  const state = useAllDSRList();

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">All Daily Sales Reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
      ) : null}

      {state.isLoading ? <PageLoader message="Loading DSRs..." /> : null}
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load DSRs" /> : null}
      {!state.isLoading && !state.isError && !state.dsrs.length ? (
        <EmptyState description="No DSRs have been submitted yet." title="No DSRs found" />
      ) : null}

      {state.dsrs.length ? (
        <ul className="space-y-3">
          {state.dsrs.map((dsr) => (
            <DSRCard
              dsr={dsr}
              key={dsr._id}
              printHref={printRoute ? printRoute.replace(":dsrId", dsr._id) : null}
              showEmployee
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
