import { ROUTES } from "../../../shared/constants";
import { MyTeamListView } from "../../../features/employees";

/**
 * A field officer sits at the bottom of the chain, so this is usually
 * empty — and says so. It exists because the tier below one role is the
 * tier above another: the same page serves an SO looking at their FOs.
 */
export default function EmployeeMyTeamPage() {
  return (
    <MyTeamListView
      description="Anyone below you, at every level."
      detailPathFor={(employee) => `${ROUTES.EMPLOYEE.MY_TEAM}/${employee._id}`}
      portalLabel="My Team"
    />
  );
}
