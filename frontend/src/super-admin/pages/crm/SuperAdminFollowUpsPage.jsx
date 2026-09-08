import { ROUTES } from "../../../shared/constants";
import { LeadFollowUpsView } from "../../../features/leads";

export default function SuperAdminFollowUpsPage({ showHeading = true }) {
  return (
    <LeadFollowUpsView
      detailPath={(lead) => `${ROUTES.SUPER_ADMIN.LEADS}/${lead._id}`}
      roleLabel="CRM"
      showHeading={showHeading}
      title="Follow-Ups"
    />
  );
}
