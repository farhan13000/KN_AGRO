import { SalesTargetsAdminView } from "../../../features/salesTargets";

export default function SuperAdminSalesTargetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Sales</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Sales Targets</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Set one monthly billing target for each sales role. Every employee in that role is measured against it, and
          each bill counts toward whoever brought the lead.
        </p>
      </div>
      <SalesTargetsAdminView />
    </div>
  );
}
