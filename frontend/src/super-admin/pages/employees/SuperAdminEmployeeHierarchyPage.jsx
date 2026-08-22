import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { EmployeeHierarchyTree, useEmployeeHierarchy } from "../../../features/employees";

export default function SuperAdminEmployeeHierarchyPage() {
  const hierarchyState = useEmployeeHierarchy();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Management</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Employee Hierarchy</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Company hierarchy from the backend hierarchy endpoint, grouped by Sales Managers and direct employees.
        </p>
      </div>

      {hierarchyState.isLoading ? <PageLoader message="Loading employee hierarchy..." /> : null}
      {hierarchyState.isError ? (
        <ErrorState message={hierarchyState.errorMessage} title="Unable to load hierarchy" />
      ) : null}
      {!hierarchyState.isLoading && !hierarchyState.isError ? (
        <EmployeeHierarchyTree hierarchy={hierarchyState.data} />
      ) : null}
    </div>
  );
}
