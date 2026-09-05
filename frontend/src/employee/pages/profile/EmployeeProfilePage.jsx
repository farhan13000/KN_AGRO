import Button from "../../../shared/components/Button";
import { ROUTES } from "../../../shared/constants";
import { MyProfileView } from "../../../features/employees";

/**
 * The Employee portal's own self-profile — the same shared MyProfileView
 * every other portal now uses (Phase F21), keeping only this portal's
 * extra "Edit Profile" action, which is the one thing that differs.
 */
export default function EmployeeProfilePage() {
  return (
    <MyProfileView
      actions={
        <Button to={ROUTES.EMPLOYEE.PROFILE_EDIT} variant="secondary">
          Edit Profile
        </Button>
      }
    />
  );
}
