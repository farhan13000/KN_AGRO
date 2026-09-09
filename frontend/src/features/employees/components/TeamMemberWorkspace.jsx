import { useState } from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS } from "../../../shared/constants";
import { PermissionGuard } from "../../../core/auth";
import { EmployeeAttendanceCalendarSection } from "../../attendance";
import { EmployeeLeaveApprovalsSection } from "../../leaves";
import { EmployeePromotionSection } from "../../promotions";
import { CurrentSalaryCard } from "../../salary";
import { SalaryProposalCreateDialog, SalaryProposalHistorySection } from "../../salaryProposals";
import { getEmployeeDisplayName } from "../utils";
import { useEmployeeDetail } from "../hooks";
import EmployeeDetailSections from "./EmployeeDetailSections";
import EmployeeRoleBadge from "./EmployeeRoleBadge";
import TeamMemberPerformanceCard from "./TeamMemberPerformanceCard";
import TransferHistoryList from "./TransferHistoryList";

/**
 * One person on your team, and everything you can do about them:
 * who they are, how they are performing, their month of attendance, their
 * leave requests, and their promotion.
 *
 * Every section gates itself on the viewer's own permissions, so the same
 * workspace serves the Super Admin, a GM, and an SO looking at their FOs
 * — each simply sees fewer cards. That is why this lives in the feature
 * layer with a `backTo` prop rather than being written three times, once
 * per portal.
 */
export default function TeamMemberWorkspace({ backTo, employeeId, portalLabel = "My Team" }) {
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
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
          <span className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-ink">{getEmployeeDisplayName(employee)}</h1>
            <EmployeeRoleBadge employee={employee} full />
          </span>
          {/* The badge above carries the role, which is authoritative.
              `designation` is free text somebody typed and is routinely
              stale, so it sits here as secondary detail, never as the
              identity. */}
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {employee?.designation || "No designation"}
            {employee?.employeeCode ? ` · ${employee.employeeCode}` : ""}
          </p>
        </div>
        {backTo ? (
          <Button to={backTo} variant="secondary">
            Back to Team
          </Button>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          {message}
        </p>
      ) : null}

      <TeamMemberPerformanceCard employeeId={employeeId} />

      <EmployeeAttendanceCalendarSection
        employeeId={employeeId}
        title={`${getEmployeeDisplayName(employee)}'s Attendance`}
      />

      <EmployeeLeaveApprovalsSection employeeId={employeeId} />

      <EmployeePromotionSection employee={employee} employeeId={employeeId} />

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
                Propose a salary change for this report. It goes to a Super Admin review before it takes
                effect.
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

      <PermissionGuard permission={PERMISSIONS.SALARY_READ}>
        <CurrentSalaryCard employeeId={employeeId} />
      </PermissionGuard>

      <SalaryProposalHistorySection employeeId={employeeId} />

      <TransferHistoryList employeeId={employeeId} />

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
