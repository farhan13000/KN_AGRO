import { ROUTES } from "../../../shared/constants";
import { MyDSRListView } from "../../../features/dsr";

export default function EmployeeMyDSRListPage({ showHeading = true }) {
  return (
    <MyDSRListView
      description="Every DSR you've submitted, newest first."
      portalLabel="Employee"
      showHeading={showHeading}
      submitHref={ROUTES.EMPLOYEE.DSR_SUBMIT}
    />
  );
}
