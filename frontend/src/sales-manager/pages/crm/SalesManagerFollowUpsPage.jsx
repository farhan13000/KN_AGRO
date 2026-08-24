import { ROUTES } from "../../../shared/constants";
import { LeadFollowUpsView } from "../../../features/leads";

export default function SalesManagerFollowUpsPage() {
  return (
    <LeadFollowUpsView
      detailPath={(lead) => `${ROUTES.SALES_MANAGER.LEADS}/${lead._id}`}
      roleLabel="Manager CRM"
      title="Follow-Ups"
    />
  );
}
