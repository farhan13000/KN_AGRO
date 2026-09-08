import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import EmployeeApprovalDialog from "./EmployeeApprovalDialog";
import EmployeeRejectionDialog from "./EmployeeRejectionDialog";
import PendingApplicationsTable from "./PendingApplicationsTable";
import { useDebouncedValue, useEmployeeListQuery, usePendingEmployees } from "../hooks";

/**
 * Employee registrations awaiting a decision.
 *
 * Lives at feature level so the standalone page and the combined
 * Approvals screen render the same implementation rather than two copies
 * that drift. `showHeading` is off inside the tabbed screen, where the
 * tab already names it.
 */
const toDialogEmployee = (application) =>
  application
    ? {
        _id: application._id,
        employeeCode: application.employeeCode,
        user: application.applicant,
        phone: application.phone,
        requestedDepartment: application.requestedDepartment,
        requestedDesignation: application.requestedDesignation,
      }
    : null;

export default function PendingApplicationsView({ showHeading = true }) {
  const { query, updateQuery } = useEmployeeListQuery();
  const [searchParams] = useSearchParams();
  const searchInput = searchParams.get("search") || "";
  const debouncedSearch = useDebouncedValue(searchInput);
  const requestQuery = { ...query, search: debouncedSearch };
  const pendingState = usePendingEmployees(requestQuery);
  const applications = pendingState.data?.applications || [];
  const pagination = pendingState.data?.pagination || {};
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [message, setMessage] = useState("");

  const refetchWithMessage = async (nextMessage) => {
    await pendingState.refetch();
    setMessage(nextMessage);
  };

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Management</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Pending Approvals</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Employee registrations waiting to be approved or rejected.
          </p>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          {message}
        </p>
      ) : null}

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label>
            <span className="form-label">Search</span>
            <input
              className="form-field"
              name="search"
              onChange={(event) => updateQuery({ search: event.target.value, page: 1 })}
              placeholder="Search pending applications"
              type="search"
              value={searchInput}
            />
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select
              className="form-field"
              name="sortBy"
              onChange={(event) => updateQuery({ sortBy: event.target.value, page: 1 })}
              value={query.sortBy}
            >
              <option value="createdAt">Registration Date</option>
              <option value="employeeCode">Employee Code</option>
            </select>
          </label>
          <label>
            <span className="form-label">Sort Order</span>
            <select
              className="form-field"
              name="sortOrder"
              onChange={(event) => updateQuery({ sortOrder: event.target.value, page: 1 })}
              value={query.sortOrder}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </label>
        </div>
      </section>

      {pendingState.isLoading ? <PageLoader message="Loading pending approvals..." /> : null}
      {pendingState.isError ? (
        <ErrorState message={pendingState.errorMessage} title="Unable to load pending approvals" />
      ) : null}
      {!pendingState.isLoading && !pendingState.isError && !applications.length ? (
        <EmptyState
          description="No employee registrations are awaiting approval."
          title="No pending approvals"
        />
      ) : null}
      {!pendingState.isLoading && !pendingState.isError && applications.length ? (
        <>
          <PendingApplicationsTable
            applications={applications}
            onApprove={(application) => setApprovalTarget(application)}
            onReject={(application) => setRejectionTarget(application)}
          />
          <Pagination
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}

      <EmployeeApprovalDialog
        employee={toDialogEmployee(approvalTarget)}
        isOpen={Boolean(approvalTarget)}
        onClose={() => setApprovalTarget(null)}
        onSuccess={() => refetchWithMessage("Employee approved successfully.")}
      />
      <EmployeeRejectionDialog
        employee={toDialogEmployee(rejectionTarget)}
        isOpen={Boolean(rejectionTarget)}
        onClose={() => setRejectionTarget(null)}
        onSuccess={() => refetchWithMessage("Employee rejected successfully.")}
      />
    </div>
  );
}
