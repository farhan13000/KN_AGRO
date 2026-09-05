import { getPortalLabelForRole, useAuth } from "../../../core/auth";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { MySalaryCard } from "../../salary/components";
import { useMyEmployeeProfile } from "../hooks";
import { isMissingEmployeeProfileError } from "../utils/employeeErrors";
import EmployeeDetailSections from "./EmployeeDetailSections";

/**
 * One self-profile implementation, used by every portal's thin wrapper
 * page — the same "shared feature-level implementation, thin portal
 * wrappers" pattern this plan uses throughout.
 *
 * SA and OA hold no Employee record at all in this org (OA sits outside
 * the sales hierarchy by design, and no seeded SA account has one), so
 * this endpoint legitimately returns nothing for them. That renders as a
 * plain explanatory state — not an error, and never a fabricated
 * placeholder profile.
 */
export default function MyProfileView({ actions = null }) {
  const { role } = useAuth();
  const profileState = useMyEmployeeProfile();
  const employee = profileState.data?.employee;

  if (profileState.isLoading) {
    return <PageLoader message="Loading your employee profile..." />;
  }

  const isMissingProfile = profileState.isError
    ? isMissingEmployeeProfileError(profileState.error)
    : !employee;

  if (profileState.isError && !isMissingProfile) {
    return <ErrorState message={profileState.errorMessage} title="Unable to load your profile" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">
            {getPortalLabelForRole(role)}
          </p>
          <h1 className="mt-2 text-3xl font-black text-ink">My Profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Your own employee record and current salary.
          </p>
        </div>
        {employee ? actions : null}
      </div>

      {isMissingProfile ? (
        <EmptyState
          description="This account signs in and holds permissions, but it isn't attached to an employee record — administrative accounts sit outside the sales reporting hierarchy."
          title="No employee profile for this account"
        />
      ) : (
        <>
          <EmployeeDetailSections
            employee={employee}
            showAccountStatus={false}
            showLifecycle={false}
            showStatusOverview={false}
          />
          <MySalaryCard />
        </>
      )}
    </div>
  );
}
