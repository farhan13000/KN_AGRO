import { SalaryProposalPipelineView } from "../../../features/salaryProposals";

export default function SalesManagerSalaryProposalApprovalsPage({ showHeading = true }) {
  return (
    <SalaryProposalPipelineView
      description="Salary change proposals for your team. You can review proposals raised for your reports; approval and finalization need Super Admin."
      portalLabel="My Team"
      showHeading={showHeading}
    />
  );
}
