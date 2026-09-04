import { ROUTES } from "../../../shared/constants";
import { MyDSRListView } from "../../../features/dsr";

export default function EmployeeMyDSRListPage() {
  return (
    <MyDSRListView
      description="Every DSR you've submitted, newest first."
      portalLabel="Employee"
      submitHref={ROUTES.EMPLOYEE.DSR_SUBMIT}
    />
  );
}
