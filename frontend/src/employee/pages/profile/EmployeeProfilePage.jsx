import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Button from "../../../shared/components/Button";
import { ROUTES } from "../../../shared/constants";
import { EmployeeDetailSections, useMyEmployeeProfile } from "../../../features/employees";

export default function EmployeeProfilePage() {
  const profileState = useMyEmployeeProfile();
  const employee = profileState.data?.employee;

  if (profileState.isLoading) {
    return <PageLoader message="Loading your employee profile..." />;
  }

  if (profileState.isError) {
    return <ErrorState message={profileState.errorMessage} title="Unable to load your profile" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Portal</p>
          <h1 className="mt-2 text-3xl font-black text-ink">My Profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Your employee profile is loaded from the dedicated self-profile endpoint.
          </p>
        </div>
        <Button to={ROUTES.EMPLOYEE.PROFILE_EDIT} variant="secondary">
          Edit Profile
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
