import { ROUTES } from "../../../shared/constants";
import { MyDSRListView } from "../../../features/dsr";

/**
 * The reports this account has filed itself — separate from the
 * company-wide DSR list, which shows everyone's.
 */
export default function SuperAdminMyDSRListPage({ showHeading = true }) {
  return (
    <MyDSRListView
      description="Every DSR you've submitted, newest first."
      portalLabel="My Work"
      printRoute={ROUTES.SUPER_ADMIN.DSR_PRINT}
      showHeading={showHeading}
      submitHref={ROUTES.SUPER_ADMIN.DSR_SUBMIT}
    />
  );
}
