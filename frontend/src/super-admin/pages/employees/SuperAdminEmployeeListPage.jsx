import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, UserPlus } from "lucide-react";
import { useAuth } from "../../../core/auth";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import {
  EMPLOYEE_STATUS,
  EMPLOYMENT_TYPE,
  EmployeeSummaryCards,
  EmployeeTable,
  useDebouncedValue,
  useEmployeeList,
  useEmployeeListQuery,
  useEmployeeSummary,
} from "../../../features/employees";

/**
 * Two different ways to add a person exist here, and they are NOT
 * interchangeable — each is gated on its own permission so a role only
 * ever sees the one it can actually complete:
 *
 * - "Add Employee" (hiring.create) opens the hiring request form, which
 *   is the canonical path for the 7-role hierarchy: it captures the
 *   Role, Region, District and reporting Manager, then runs
 *   Request -> Process (OA) -> Review (GM) -> Approve (SA) -> Complete,
 *   and only that final step creates the real User + Employee. This is
 *   the path OA has, since OA deliberately never holds HIRING_APPROVE.
 *
 * - "Create Directly" (employees.create) is the legacy one-shot create.
 *   It bypasses approval entirely and is effectively SA-only. Note it
 *   cannot express the new hierarchy at all: EmployeeService.
 *   createEmployee still hardcodes the legacy `employee` role and its
 *   schema accepts no role/region/district. That is a known backend gap,
 *   not something this page can paper over — which is exactly why the
 *   hiring flow, not this button, is the primary action.
 *
 * Before this, both the button and its route were ungated, so OA saw a
 * "Create Employee" button, filled in the whole form, and got a 403 on
 * submit — OA has never held employees.create.
 */
export default function SuperAdminEmployeeListPage() {
  const { hasPermission } = useAuth();
  const canRequestHire = hasPermission(PERMISSIONS.HIRING_CREATE);
  const canCreateDirectly = hasPermission(PERMISSIONS.EMPLOYEES_CREATE);
  const { query, updateQuery } = useEmployeeListQuery();
  const [searchParams] = useSearchParams();
  const searchInput = searchParams.get("search") || "";
  const debouncedSearch = useDebouncedValue(searchInput);
  const requestQuery = { ...query, search: debouncedSearch };
  const employeesState = useEmployeeList(requestQuery);
  const summaryState = useEmployeeSummary();
  const employees = employeesState.data?.employees || [];
  const pagination = employeesState.data?.pagination || {};

  const handleFilterChange = (event) => {
    updateQuery({ [event.target.name]: event.target.value, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Management</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Employees</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Search and manage employee profiles using backend pagination and scoped permissions.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canCreateDirectly ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              title="Creates the account immediately, without the hiring approval workflow."
              to={ROUTES.SUPER_ADMIN.EMPLOYEE_CREATE}
            >
              <Plus className="h-4 w-4" />
              Create Directly
            </Link>
          ) : null}
          {canRequestHire ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
              title="Raise a hiring request with role, region, district and reporting manager."
              to={ROUTES.SUPER_ADMIN.HIRING_CREATE}
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Link>
          ) : null}
        </div>
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
                placeholder="Search code, name, email"
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
              <option value="employmentType">Employment Type</option>
            </select>
          </label>
          <label>
            <span className="form-label">Sort Order</span>
            <select className="form-field" name="sortOrder" onChange={handleFilterChange} value={query.sortOrder}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
        </div>
      </section>

      {!summaryState.isLoading && !summaryState.isError ? (
        <EmployeeSummaryCards summary={summaryState.data} />
      ) : null}

      {employeesState.isLoading ? <PageLoader message="Loading employees..." /> : null}
      {employeesState.isError ? <ErrorState message={employeesState.errorMessage} title="Unable to load employees" /> : null}
      {!employeesState.isLoading && !employeesState.isError && !employees.length ? (
        <EmptyState
          actionLabel={canRequestHire ? "Add Employee" : canCreateDirectly ? "Create Directly" : undefined}
          actionTo={
            canRequestHire
              ? ROUTES.SUPER_ADMIN.HIRING_CREATE
              : canCreateDirectly
                ? ROUTES.SUPER_ADMIN.EMPLOYEE_CREATE
                : undefined
          }
          description="No employee records matched the current filters."
          title="No employees found"
        />
      ) : null}
      {!employeesState.isLoading && !employeesState.isError && employees.length ? (
        <>
          <EmployeeTable employees={employees} />
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
