import DashboardShell from "../../shared/components/DashboardShell";

export default function SuperAdminDashboardPage() {
  return (
    <DashboardShell
      description="System-wide control starts here. Authentication, routing, and the protected shell are in place before full management modules are added."
      title="Admin Dashboard"
    />
  );
}

