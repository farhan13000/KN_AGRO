import { formatMoney } from "../../../shared/utils";

const Row = ({ emphasis = false, label, value }) => (
  <div className={`flex items-baseline justify-between gap-4 py-1.5 ${emphasis ? "font-black text-ink" : ""}`}>
    <span className={emphasis ? "" : "text-sm text-muted"}>{label}</span>
    <span className={`tabular-nums ${emphasis ? "" : "text-sm font-semibold text-ink"}`}>{value}</span>
  </div>
);

/**
 * Renders THIS payroll record's own frozen figures.
 *
 * Everything here comes from the record's `salaryStructureSnapshot` /
 * `attendanceSummary`, never from the employee's currently-active salary
 * structure — if their structure changed after this month was generated,
 * showing the live one would misrepresent what they were actually paid.
 *
 * Amounts arrive from the API already in rupees (payroll.serializer.js
 * runs every money field through `toRupees`), so nothing is converted here.
 */
export default function PayslipBreakdown({ payroll }) {
  if (!payroll) return null;

  const snapshot = payroll.salaryStructureSnapshot || {};
  const allowances = snapshot.allowances || [];
  const fixedDeductions = snapshot.fixedDeductions || [];
  const attendance = payroll.attendanceSummary || {};

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section>
        <h4 className="text-xs font-black uppercase tracking-wide text-agriculture">Earnings</h4>
        <div className="mt-2 divide-y divide-forest/10">
          <Row label="Basic Salary" value={formatMoney(snapshot.basicSalary)} />
          {allowances.map((item) => (
            <Row key={item.name} label={item.name} value={formatMoney(item.amount)} />
          ))}
          {payroll.additionalIncentives ? (
            <Row label="Additional Incentives" value={formatMoney(payroll.additionalIncentives)} />
          ) : null}
          <Row emphasis label="Gross Salary" value={formatMoney(payroll.grossSalary)} />
        </div>
      </section>

      <section>
        <h4 className="text-xs font-black uppercase tracking-wide text-agriculture">Deductions</h4>
        <div className="mt-2 divide-y divide-forest/10">
          {fixedDeductions.length ? (
            fixedDeductions.map((item) => (
              <Row key={item.name} label={item.name} value={formatMoney(item.amount)} />
            ))
          ) : (
            <Row label="Fixed deductions" value={formatMoney(0)} />
          )}
          <Row label="Attendance Deduction" value={formatMoney(payroll.attendanceDeduction)} />
          <Row label="Leave Deduction" value={formatMoney(payroll.leaveDeduction)} />
          {payroll.additionalDeductions ? (
            <Row label="Additional Deductions" value={formatMoney(payroll.additionalDeductions)} />
          ) : null}
          <Row emphasis label="Total Deductions" value={formatMoney(payroll.totalDeductions)} />
        </div>
      </section>

      <section className="md:col-span-2">
        <h4 className="text-xs font-black uppercase tracking-wide text-agriculture">Attendance This Period</h4>
        <div className="mt-2 flex flex-wrap gap-x-8 gap-y-1 text-sm text-muted">
          {Object.entries(attendance).length ? (
            Object.entries(attendance).map(([key, value]) => (
              <span key={key}>
                <span className="font-semibold text-ink">{value}</span>{" "}
                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
              </span>
            ))
          ) : (
            <span>No attendance summary recorded for this period.</span>
          )}
        </div>
      </section>

      <section className="md:col-span-2 rounded-lg bg-mint/60 p-4">
        <Row emphasis label="Net Salary" value={formatMoney(payroll.netSalary)} />
        {payroll.remarks ? <p className="mt-2 text-sm text-muted">Remarks: {payroll.remarks}</p> : null}
      </section>
    </div>
  );
}
