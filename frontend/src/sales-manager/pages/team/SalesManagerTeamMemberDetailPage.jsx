import { useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import { EmployeeDetailSections, getEmployeeDisplayName, useEmployeeDetail } from "../../../features/employees";

export default function SalesManagerTeamMemberDetailPage() {
  const { employeeId } = useParams();
  const employeeState = useEmployeeDetail(employeeId);
  const employee = employeeState.data?.employee;

  if (employeeState.isLoading) {
    return <PageLoader message="Loading team member..." />;
  }

  if (employeeState.isError) {
    return <ErrorState message={employeeState.errorMessage} title="Unable to load team member" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">My Team</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{getEmployeeDisplayName(employee)}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            This detail view uses backend employee scope. Unauthorized team-member URLs should be denied by the backend.
          </p>
        </div>
        <Button to={ROUTES.SALES_MANAGER.TEAM} variant="secondary">
          Back to Team
        </Button>
      </div>

      <EmployeeDetailSections
        employee={employee}
        showAccountStatus={false}
        showLifecycle={false}
        showStatusOverview={false}
      />
    </div>
  );
}
