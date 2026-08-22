import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import { getEmployeeDisplayName } from "../utils";

function EmployeeNode({ employee, managerName }) {
  return (
    <div className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-ink">{getEmployeeDisplayName(employee)}</p>
          <p className="mt-1 text-xs font-semibold text-muted">
            {employee.employeeCode || "No code"} | {employee.designation || "No designation"}
          </p>
          {managerName ? (
            <p className="mt-1 text-xs font-semibold text-muted">Manager: {managerName}</p>
          ) : null}
        </div>
        <EmployeeStatusBadge status={employee.employeeStatus} />
      </div>
    </div>
  );
}

function ManagerGroup({ group }) {
  const [open, setOpen] = useState(true);
  const manager = group.manager;
  const reports = group.employees || [];

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <button
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-3">
          {open ? <ChevronDown className="h-5 w-5 text-forest" /> : <ChevronRight className="h-5 w-5 text-forest" />}
          <span className="min-w-0">
            <span className="block truncate text-base font-black text-ink">{getEmployeeDisplayName(manager)}</span>
            <span className="mt-1 block truncate text-xs font-semibold text-muted">
              {manager.employeeCode || "No code"} | {manager.designation || "No designation"} | {reports.length} direct reports
            </span>
          </span>
        </span>
        <EmployeeStatusBadge status={manager.employeeStatus} />
      </button>

      {open ? (
        <div className="mt-4 grid gap-3 border-l-2 border-mint pl-4">
          {reports.length ? (
            reports.map((employee) => (
              <EmployeeNode employee={employee} key={employee._id} managerName={getEmployeeDisplayName(manager)} />
            ))
          ) : (
            <p className="rounded-lg bg-mint/60 px-4 py-3 text-sm font-semibold text-muted">
              No direct employees assigned.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default function EmployeeHierarchyTree({ hierarchy }) {
  const managers = hierarchy?.managers || [];
  const unassignedEmployees = hierarchy?.unassignedEmployees || [];

  if (!managers.length && !unassignedEmployees.length) {
    return <EmptyState description="No active hierarchy records are available." title="No hierarchy data" />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-forest/10 bg-mint/60 p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Super Admin</p>
        <h2 className="mt-1 text-xl font-black text-forest">Company employee hierarchy</h2>
      </section>

      <div className="grid gap-4">
        {managers.map((group) => (
          <ManagerGroup group={group} key={group.manager?._id} />
        ))}
      </div>

      {unassignedEmployees.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-black text-ink">Unassigned Employees</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {unassignedEmployees.map((employee) => (
              <EmployeeNode employee={employee} key={employee._id} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
