import { ROUTES } from "../../../shared/constants";
import { MyDSRListView } from "../../../features/dsr";

export default function SalesManagerMyDSRListPage() {
  return (
    <MyDSRListView
      description="Every DSR you've submitted, newest first."
      portalLabel="My Team"
      submitHref={ROUTES.SALES_MANAGER.DSR_SUBMIT}
    />
  );
}
