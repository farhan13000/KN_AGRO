import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { EMPLOYEE_STATUS, EMPLOYMENT_TYPE } from "../constants";
import { useEmployeeListQuery, useMyTeam } from "../hooks";
import { useDebouncedValue } from "../../../shared/hooks";
import { isMissingEmployeeProfileError } from "../utils/employeeErrors";
import TeamHierarchyTable from "./TeamHierarchyTable";

/**
 * The people who report to you, in any portal.
 *
 * It always asks GET /employees/my-team, which derives the manager from
 * the caller — there is no employeeId to pass and no way to ask for
 * someone else's team. That is why the same view is safe to mount in the
 * Super Admin, manager and field portals: what comes back is decided by
 * who is asking, not by which portal they are in.
 *
 * That endpoint returns the ENTIRE downline, not one tier, so the rows are
 * drawn as a tree. The page size is raised to the endpoint's maximum for
 * the same reason: a chain split across pages is not a hierarchy.
 *
 * `detailPathFor` is required because each portal keeps its own URL space
 * for a team member; without it the table would link every portal into
 * the manager one.
 */
export default function MyTeamListView({
  description = "Everyone below you, at every level.",
  detailPathFor,
  emptyDescription = "Nobody reports to you yet. When someone is assigned under you, they appear here with their whole chain.",
  portalLabel = "My Team",
  showHeading = true,
  title = "My Team",
}) {
  const { query, updateQuery } = useEmployeeListQuery();
  const [searchParams] = useSearchParams();
  const searchInput = searchParams.get("search") || "";
  const debouncedSearch = useDebouncedValue(searchInput);
  const teamState = useMyTeam({ ...query, limit: 100, search: debouncedSearch });
  const employees = teamState.data?.employees || [];
  const pagination = teamState.data?.pagination || {};

  // An account with no Employee record of its own (an SA or OA that sits
  // outside the sales hierarchy) gets a 404 from this endpoint. That is a
  // real state, not a failure — it means "you are not in the chain", so
  // it reads as an empty team rather than a red error banner.
  const hasNoProfile = teamState.isError && isMissingEmployeeProfileError(teamState.error);
  const showError = teamState.isError && !hasNoProfile;

  const handleFilterChange = (event) => {
    updateQuery({ [event.target.name]: event.target.value, page: 1 });
  };

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
      ) : null}

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="xl:col-span-2">
            <span className="form-label">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-10"
                name="search"
                onChange={handleFilterChange}
                placeholder="Search your team"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Employee Status</span>
            <select
              className="form-field"
              name="employeeStatus"
              onChange={handleFilterChange}
              value={query.employeeStatus}
            >
              <option value="">All statuses</option>
              {Object.values(EMPLOYEE_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Employment Type</span>
            <select
              className="form-field"
              name="employmentType"
              onChange={handleFilterChange}
              value={query.employmentType}
            >
              <option value="">All types</option>
              {Object.values(EMPLOYMENT_TYPE).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {teamState.isLoading ? <PageLoader message="Loading your team..." /> : null}
      {showError ? <ErrorState message={teamState.errorMessage} title="Unable to load team" /> : null}
      {hasNoProfile ? (
        <EmptyState
          description="This account has no employee record of its own, so nobody reports to it directly. The full company is under Employees and Hierarchy."
          title="You are not in the reporting chain"
        />
      ) : null}
      {!teamState.isLoading && !teamState.isError && !employees.length ? (
        <EmptyState description={emptyDescription} title="No team members" />
      ) : null}
      {!teamState.isLoading && !teamState.isError && employees.length ? (
        <>
          <TeamHierarchyTable detailPathFor={detailPathFor} employees={employees} />
          <Pagination
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}
    </div>
  );
}
