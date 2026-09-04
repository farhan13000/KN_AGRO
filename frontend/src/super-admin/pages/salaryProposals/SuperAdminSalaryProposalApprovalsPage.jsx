import { SalaryProposalPipelineView } from "../../../features/salaryProposals";

export default function SuperAdminSalaryProposalApprovalsPage() {
  return (
    <SalaryProposalPipelineView
      description="Salary change proposals across the org. Approve and finalize are Super Admin-only; the backend still enforces which stage each actor may act on."
      portalLabel="Org Structure"
    />
  );
}
