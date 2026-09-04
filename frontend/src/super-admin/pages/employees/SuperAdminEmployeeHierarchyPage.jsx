import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { EmployeeHierarchyTree, useAllEmployees } from "../../../features/employees";

export default function SuperAdminEmployeeHierarchyPage() {
  // Sourced from the ordinary (scope-filtered) employee list, not the
  // backend's /employees/hierarchy endpoint — see EmployeeHierarchyTree's
  // own note on why that endpoint can't represent the 7-role hierarchy.
  const employeesState = useAllEmployees();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Management</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Employee Hierarchy</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The reporting chain at full depth — every employee nested under their manager, however many
          levels deep the chain runs.
        </p>
      </div>

      {employeesState.isLoading ? <PageLoader message="Loading employee hierarchy..." /> : null}
      {employeesState.isError ? (
        <ErrorState message={employeesState.errorMessage} title="Unable to load hierarchy" />
      ) : null}
      {!employeesState.isLoading && !employeesState.isError ? (
        <EmployeeHierarchyTree employees={employeesState.employees} />
      ) : null}
    </div>
  );
}
