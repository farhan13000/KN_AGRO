import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SuperAdminLeadListPage from "./SuperAdminLeadListPage";
import SuperAdminCrmPipelinePage from "./SuperAdminCrmPipelinePage";
import SuperAdminFollowUpsPage from "./SuperAdminFollowUpsPage";

/**
 * One set of leads, three ways of looking at it: the list, the pipeline
 * board, and what is due next. They were three sidebar entries reading the
 * same records, so moving between them is a tab, not a navigation.
 */
const TABS = [
  {
    id: "list",
    label: "All leads",
    permission: PERMISSIONS.LEADS_READ,
    blurb: "Every backend-scoped lead, with filters, assignment and pipeline value.",
    render: () => <SuperAdminLeadListPage showHeading={false} />,
  },
  {
    id: "pipeline",
    label: "Pipeline",
    permission: PERMISSIONS.LEADS_READ,
    blurb: "The same leads as a stage-by-stage board.",
    render: () => <SuperAdminCrmPipelinePage showHeading={false} />,
  },
  {
    id: "follow-ups",
    label: "Follow-ups",
    permission: PERMISSIONS.LEADS_READ,
    blurb: "Leads with a follow-up due, overdue first.",
    render: () => <SuperAdminFollowUpsPage showHeading={false} />,
  },
];

export default function SuperAdminLeadsWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Leads as a list, as a pipeline, and by what is due next."
      emptyDescription="You do not have permission to view leads."
      emptyTitle="No lead access"
      eyebrow="CRM"
      tabs={TABS}
      title="Leads"
    />
  );
}
