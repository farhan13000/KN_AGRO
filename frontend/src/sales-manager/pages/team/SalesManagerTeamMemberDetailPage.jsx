import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { PermissionGuard } from "../../../core/auth";
import {
  EmployeeDetailSections,
  TransferHistoryList,
  getEmployeeDisplayName,
  useEmployeeDetail,
} from "../../../features/employees";
import { CurrentSalaryCard } from "../../../features/salary";
import { SalaryProposalCreateDialog, SalaryProposalHistorySection } from "../../../features/salaryProposals";

export default function SalesManagerTeamMemberDetailPage() {
  const { employeeId } = useParams();
  const employeeState = useEmployeeDetail(employeeId);
  const employee = employeeState.data?.employee;
  const [salaryProposalOpen, setSalaryProposalOpen] = useState(false);
  const [message, setMessage] = useState("");

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

      {message ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          {message}
        </p>
      ) : null}

      <EmployeeDetailSections
        employee={employee}
        showAccountStatus={false}
        showLifecycle={false}
        showStatusOverview={false}
      />

      <PermissionGuard permission={PERMISSIONS.SALARY_PROPOSAL_CREATE}>
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-ink">Salary</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Propose a salary change for this report. It goes to a GM/SA review before it takes effect.
              </p>
            </div>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              onClick={() => setSalaryProposalOpen(true)}
              type="button"
            >
              Propose Salary Change
            </button>
          </div>
        </Card>
      </PermissionGuard>

      <TransferHistoryList employeeId={employeeId} />

      <PermissionGuard permission={PERMISSIONS.SALARY_READ}>
        <CurrentSalaryCard employeeId={employeeId} />
      </PermissionGuard>

      <SalaryProposalHistorySection employeeId={employeeId} />

      <SalaryProposalCreateDialog
        employee={employee}
        isOpen={salaryProposalOpen}
        onClose={() => setSalaryProposalOpen(false)}
        onSuccess={() => {
          setSalaryProposalOpen(false);
          setMessage("Salary change proposed.");
        }}
      />
    </div>
  );
}
