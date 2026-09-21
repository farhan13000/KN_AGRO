import { SalaryProposalPipelineView } from "../../../features/salaryProposals";

export default function SuperAdminSalaryProposalApprovalsPage() {
  return (
    <SalaryProposalPipelineView
      description="Salary change proposals from across the company. Only the Super Admin can approve and finalize, and each proposal moves one stage at a time."
      portalLabel="Org Structure"
    />
  );
}
