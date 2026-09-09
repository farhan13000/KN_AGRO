import { ROUTES } from "../../../shared/constants";
import { MyTeamListView } from "../../../features/employees";

export default function SalesManagerTeamPage() {
  return (
    <MyTeamListView
      description="Everyone below you, at every level. Open a person to see their performance, attendance, leave and promotions."
      detailPathFor={(employee) => `${ROUTES.SALES_MANAGER.TEAM}/${employee._id}`}
      portalLabel="My Team"
    />
  );
}
