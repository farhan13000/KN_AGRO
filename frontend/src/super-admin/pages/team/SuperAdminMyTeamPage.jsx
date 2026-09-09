import { ROUTES } from "../../../shared/constants";
import { MyTeamListView } from "../../../features/employees";

/**
 * The Super Admin's own direct reports. Distinct from Employees, which is
 * the whole company: this answers "who reports to me", which is the same
 * question every other role asks of this page.
 */
export default function SuperAdminMyTeamPage() {
  return (
    <MyTeamListView
      description="Everyone below you, at every level. Open a person to see their performance, attendance, leave and promotions."
      detailPathFor={(employee) => `${ROUTES.SUPER_ADMIN.MY_TEAM}/${employee._id}`}
      portalLabel="Super Admin"
    />
  );
}
