const summaryItems = [
  { key: "totalEmployees", label: "Total Employees" },
  { key: "activeEmployees", label: "Active" },
  { key: "pendingApprovals", label: "Pending Approval" },
  { key: "inactiveEmployees", label: "Inactive" },
  { key: "salesManagers", label: "Managers" },
];

export default function EmployeeSummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {summaryItems.map((item) => (
        <div className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm" key={item.key}>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-agriculture">{item.label}</p>
          <p className="mt-2 text-3xl font-black text-ink">{summary[item.key] ?? 0}</p>
        </div>
      ))}
    </section>
  );
}
