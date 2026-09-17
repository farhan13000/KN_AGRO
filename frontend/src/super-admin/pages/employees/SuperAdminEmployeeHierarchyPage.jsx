import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { useEmployeePerformance } from "../../../features/analytics/hooks";
import { OrgFlowChart, useAllEmployees } from "../../../features/employees";
import { LocationFilterFields } from "../../../features/geo";

const getQueryValue = (searchParams, key) => searchParams.get(key) || "";

export default function SuperAdminEmployeeHierarchyPage() {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationFilter = {
    state: getQueryValue(searchParams, "state"),
    district: getQueryValue(searchParams, "district"),
    post: getQueryValue(searchParams, "post"),
  };
  const handleLocationFilterChange = (next) => {
    const params = new URLSearchParams(searchParams);
    ["state", "district", "post"].forEach((key) => {
      if (next[key]) params.set(key, next[key]);
      else params.delete(key);
    });
    setSearchParams(params);
  };

  // Built from the ordinary (scope-filtered) employee list, not the
  // backend's /employees/hierarchy endpoint — that returns flat
  // manager/direct-report pairs and cannot express a five-level chain,
  // let alone the owner and deputy who sit outside it. Search by location
  // narrows the roster to whoever's own coverage names that place; a
  // person whose manager falls outside the filter simply surfaces at the
  // top level instead of under them, the same way a person with no
  // manager at all already does.
  const employeesState = useAllEmployees(locationFilter);

  // Company-wide performance is admin-only. Requested only when the
  // viewer actually holds it, so a manager reaching this page gets the
  // chart without figures rather than a 403.
  const canSeePerformance = hasPermission(PERMISSIONS.ANALYTICS_ADMIN);
  const performanceState = useEmployeePerformance({ ...locationFilter, enabled: canSeePerformance });
  const performanceRows = performanceState.data?.employees || performanceState.data || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Management</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Company Hierarchy</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Each node carries the totals for that person and everyone beneath them, so a General
          Manager shows their whole organisation and a Sales Officer shows their own field team.
          Open a branch to go a level deeper, or select a name to open the full record.
        </p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <p className="form-label">Location — search by where someone covers</p>
        <LocationFilterFields onChange={handleLocationFilterChange} value={locationFilter} />
      </section>

      {employeesState.isLoading ? <PageLoader message="Loading company hierarchy..." /> : null}
      {employeesState.isError ? (
        <ErrorState message={employeesState.errorMessage} title="Unable to load hierarchy" />
      ) : null}
      {!employeesState.isLoading && !employeesState.isError ? (
        <OrgFlowChart
          detailPathFor={(employee) => `${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employee._id}`}
          employees={employeesState.employees}
          performanceRows={Array.isArray(performanceRows) ? performanceRows : []}
        />
      ) : null}
    </div>
  );
}
