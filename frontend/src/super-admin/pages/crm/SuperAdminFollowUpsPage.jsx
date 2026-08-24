import { ROUTES } from "../../../shared/constants";
import { LeadFollowUpsView } from "../../../features/leads";

export default function SuperAdminFollowUpsPage() {
  return (
    <LeadFollowUpsView
      detailPath={(lead) => `${ROUTES.SUPER_ADMIN.LEADS}/${lead._id}`}
      roleLabel="CRM"
      title="Follow-Ups"
    />
  );
}
