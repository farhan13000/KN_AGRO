import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import {
  EMPLOYEE_STATUS,
  EMPLOYMENT_TYPE,
  TeamMembersTable,
  useDebouncedValue,
  useEmployeeListQuery,
  useMyTeam,
} from "../../../features/employees";

export default function SalesManagerTeamPage() {
  const { query, updateQuery } = useEmployeeListQuery();
  const [searchParams] = useSearchParams();
  const searchInput = searchParams.get("search") || "";
  const debouncedSearch = useDebouncedValue(searchInput);
  const requestQuery = { ...query, search: debouncedSearch };
  const teamState = useMyTeam(requestQuery);
  const employees = teamState.data?.employees || [];
  const pagination = teamState.data?.pagination || {};

  const handleFilterChange = (event) => {
    updateQuery({ [event.target.name]: event.target.value, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Sales Manager Portal</p>
        <h1 className="mt-2 text-3xl font-black text-ink">My Team</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Team records are loaded from the backend manager-team endpoint scoped to your account.
        </p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="xl:col-span-2">
            <span className="form-label">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-10"
                name="search"
                onChange={handleFilterChange}
                placeholder="Search team members"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Employee Status</span>
            <select className="form-field" name="employeeStatus" onChange={handleFilterChange} value={query.employeeStatus}>
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
            <select className="form-field" name="employmentType" onChange={handleFilterChange} value={query.employmentType}>
              <option value="">All types</option>
              {Object.values(EMPLOYMENT_TYPE).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Department</span>
            <input className="form-field" name="department" onChange={handleFilterChange} type="text" value={query.department} />
          </label>
          <label>
            <span className="form-label">Designation</span>
            <input className="form-field" name="designation" onChange={handleFilterChange} type="text" value={query.designation} />
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="createdAt">Created</option>
              <option value="employeeCode">Employee Code</option>
              <option value="dateOfJoining">Joining Date</option>
              <option value="department">Department</option>
              <option value="designation">Designation</option>
              <option value="employeeStatus">Employee Status</option>
            </select>
          </label>
        </div>
      </section>

      {teamState.isLoading ? <PageLoader message="Loading your team..." /> : null}
      {teamState.isError ? <ErrorState message={teamState.errorMessage} title="Unable to load team" /> : null}
      {!teamState.isLoading && !teamState.isError && !employees.length ? (
        <EmptyState
          description="No employees are currently assigned to your team or matched the current filters."
          title="No team members found"
        />
      ) : null}
      {!teamState.isLoading && !teamState.isError && employees.length ? (
        <>
          <TeamMembersTable employees={employees} />
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
