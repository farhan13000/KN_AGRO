import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, UserCheck } from "lucide-react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { PermissionGuard } from "../../../core/auth";
import { useAuth } from "../../../core/auth";
import { env } from "../../../core/config";
import {
  DirectReportsList,
  EmployeeApprovalDialog,
  EmployeeDetailSections,
  EmployeeLifecycleDialog,
  EmployeeRejectionDialog,
  ManagerAssignmentDialog,
  EMPLOYEE_LIFECYCLE_ACTIONS,
  canShowEmployeeLifecycleAction,
  getEmployeeDisplayName,
  useEmployeeDetail,
} from "../../../features/employees";

export default function SuperAdminEmployeeDetailPage() {
  const { employeeId } = useParams();
  const { hasPermission } = useAuth();
  const employeeState = useEmployeeDetail(employeeId);
  const employee = employeeState.data?.employee;
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [lifecycleAction, setLifecycleAction] = useState("");
  const [message, setMessage] = useState("");

  const refetchWithMessage = async (nextMessage) => {
    await employeeState.refetch();
    setMessage(nextMessage);
  };
  const canShow = (action) => canShowEmployeeLifecycleAction({ employee, action, hasPermission });

  if (employeeState.isLoading) {
    return <PageLoader message="Loading employee details..." />;
  }

  if (employeeState.isError) {
    return <ErrorState message={employeeState.errorMessage} title="Unable to load employee" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Details</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{getEmployeeDisplayName(employee)}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Identity, profile, manager, account, and lifecycle fields from the backend employee record.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button to={ROUTES.SUPER_ADMIN.EMPLOYEES} variant="secondary">
            Back to Employees
          </Button>
          <PermissionGuard permission={PERMISSIONS.EMPLOYEES_UPDATE}>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employeeId}/edit`}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          {message}
        </p>
      ) : null}

      <EmployeeDetailSections employee={employee} />

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-ink">Lifecycle Actions</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              These actions call dedicated backend endpoints and then reload the authoritative record.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PermissionGuard permission={PERMISSIONS.EMPLOYEES_APPROVE}>
              {canShow(EMPLOYEE_LIFECYCLE_ACTIONS.APPROVE) ? (
                <>
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                    onClick={() => setApprovalOpen(true)}
                    type="button"
                  >
                    <UserCheck className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-50 px-5 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
                    onClick={() => setRejectionOpen(true)}
                    type="button"
                  >
                    Reject
                  </button>
                </>
              ) : null}
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.EMPLOYEES_ASSIGN_MANAGER}>
              {canShow(EMPLOYEE_LIFECYCLE_ACTIONS.ASSIGN_MANAGER) ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                  onClick={() => setManagerOpen(true)}
                  type="button"
                >
                  Assign Manager
                </button>
              ) : null}
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.EMPLOYEES_DEACTIVATE}>
              {canShow(EMPLOYEE_LIFECYCLE_ACTIONS.DEACTIVATE) ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                  onClick={() => setLifecycleAction("deactivate")}
                  type="button"
                >
                  Deactivate
                </button>
              ) : null}
              {canShow(EMPLOYEE_LIFECYCLE_ACTIONS.RESIGN) ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                  onClick={() => setLifecycleAction("resign")}
                  type="button"
                >
                  Mark Resigned
                </button>
              ) : null}
              {canShow(EMPLOYEE_LIFECYCLE_ACTIONS.TERMINATE) ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800"
                  onClick={() => setLifecycleAction("terminate")}
                  type="button"
                >
                  Terminate
                </button>
              ) : null}
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.EMPLOYEES_UPDATE}>
              {canShow(EMPLOYEE_LIFECYCLE_ACTIONS.REACTIVATE) ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                  onClick={() => setLifecycleAction("reactivate")}
                  type="button"
                >
                  Reactivate
                </button>
              ) : null}
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.EMPLOYEES_PROMOTE}>
              {canShow(EMPLOYEE_LIFECYCLE_ACTIONS.PROMOTE) ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                  onClick={() => setLifecycleAction("promote")}
                  type="button"
                >
                  Promote to Sales Manager
                </button>
              ) : null}
            </PermissionGuard>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-black text-ink">Direct Reports</h2>
        <DirectReportsList employeeId={employeeId} />
      </section>

      <EmployeeApprovalDialog
        employee={employee}
        isOpen={approvalOpen}
        onClose={() => setApprovalOpen(false)}
        onSuccess={() => refetchWithMessage("Employee approved successfully.")}
      />
      <EmployeeRejectionDialog
        employee={employee}
        isOpen={rejectionOpen}
        onClose={() => setRejectionOpen(false)}
        onSuccess={() => refetchWithMessage("Employee rejected successfully.")}
      />
      <ManagerAssignmentDialog
        employee={employee}
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        onSuccess={() => refetchWithMessage("Manager assignment updated.")}
      />
      <EmployeeLifecycleDialog
        action={lifecycleAction}
        employee={employee}
        isOpen={Boolean(lifecycleAction)}
        onClose={() => setLifecycleAction("")}
        onSuccess={() => refetchWithMessage("Employee lifecycle action completed.")}
        salesManagerRoleId={env.salesManagerRoleId}
      />
    </div>
  );
}
