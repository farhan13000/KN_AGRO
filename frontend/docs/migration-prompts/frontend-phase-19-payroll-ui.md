# Frontend Migration Phase 19 — Payroll UI

**Depends on:** Backend Phase 12/14-era payroll module (already built, verified, live — mounted at
`/payroll`). Frontend Phase F08 (Salary Proposal — a related but distinct workflow: a proposal
changes an employee's *salary structure*; payroll *runs* against whatever structure is currently
active). **Type:** wholly new — the only payroll-related frontend code today is a passive "Latest
Payroll" readout on the employee's own dashboard (Phase F12); no payroll *run* management exists
anywhere.

**Read first:** `backend/src/modules/payroll/payroll.model.js` — one document per
employee-per-month, `DRAFT -> PROCESSED -> PAID` (or `-> CANCELLED` from either of the first two),
snapshotting `salaryStructureSnapshot`/`attendanceSummary` at generation time so a later salary
change never silently rewrites an already-generated payroll. Confirmed against `seedRoles.js`:

- `PAYROLL_READ_SELF`: every seeded role with an Employee record (already consumed by the Phase
  F12 dashboard readout — don't rebuild that, this phase adds the fuller self-service history view
  and the admin run-management side).
- `PAYROLL_READ` (full, company-wide): OA + SA wildcard only — **not** GM/RM/ASM/SO (this is a
  narrower admin permission than most, since payroll is company-financial data, not sales-hierarchy
  data — do not widen it to manager tiers on the frontend just because other modules show team
  data to them).
- `PAYROLL_PROCESS`/`PAYROLL_MANAGE`/`PAYROLL_MARK_PAID`: nobody directly — SA wildcard only.

---

## Prompt 19.1 — Payroll API layer

```
Add a `PAYROLL` endpoint block to `apiConfig.js`. Paths, from
`BACKEND/backend/src/modules/payroll/payroll.routes.js`: POST /generate, POST /generate-bulk,
GET /me, GET / (admin, all), POST /:payrollId/process, POST /:payrollId/mark-paid,
GET /:payrollId (single record — check the controller directly for its access rule; the route
comment notes it deliberately has no simple `authorize(PERMISSION)` call, it's gated by a
custom in-service check instead — don't assume `PAYROLL_READ` alone covers it).

Create `src/features/payroll/services/payrollApi.js` with matching functions. Money fields
(`amount`, `basicSalary`, `grossSalary`, `netSalary`, every line item in `allowances`/
`fixedDeductions`, `attendanceDeduction`, `leaveDeduction`, `additionalIncentives`,
`additionalDeductions`, `totalDeductions`) need the same paise/rupees conversion handling every
other money field in this codebase already gets — check `payroll.serializer.js` directly to
confirm which direction conversion happens server-side before assuming the frontend needs to do
anything (Phase F08 found SalaryProposal's own responses do NOT auto-convert; Phase F10 found DSR's
DO — don't assume either way for Payroll, verify it directly).
```

**Acceptance criteria:** API functions exist and match the backend's actual routes/permissions;
money-field handling is verified against the real serializer, not assumed from either prior
phase's precedent.

---

## Prompt 19.2 — Self-service: my payroll history

```
Build `MyPayrollPage.jsx` (`GET /payroll/me`, paginated by month/year) for both the Employee and
Sales Manager portals — every seeded role holds `PAYROLL_READ_SELF`. Show each month's
grossSalary/totalDeductions/netSalary/status, with a detail expand showing the full breakdown
(allowances, fixed deductions, attendance/leave deductions, incentives) sourced from
`salaryStructureSnapshot`/`attendanceSummary` — render the SNAPSHOT values (this record's own
frozen figures), never re-fetch the employee's *current* salary structure and show that instead,
which would misrepresent what they were actually paid that month if their structure has since
changed. Add a nav entry ("My Payroll") to both portals, replacing/supplementing the existing
dashboard "Latest Payroll" readout — don't remove that readout, this is the fuller history view it
should link to.
```

**Acceptance criteria:** a real employee's payroll history renders correctly with accurate
snapshotted figures, not their current live salary structure.

---

## Prompt 19.3 — Admin: generate, process, mark paid

```
Build `PayrollRunPage.jsx` (or similar) in the Super Admin portal:
- `PayrollGenerateDialog.jsx` — single-employee (`POST /generate`) and bulk (`POST /generate-bulk`,
  check its exact payload — likely a month/year plus a scope like "all active employees" or a
  department filter, don't guess, read `generatePayrollBulkSchema` directly) generation, gated
  `PAYROLL_PROCESS`.
- `AllPayrollPage.jsx` (`GET /`, gated `PAYROLL_READ`) — company-wide list, filterable by month/
  year/status/employee.
- Process (`POST /:id/process`, DRAFT -> PROCESSED) and Mark Paid (`POST /:id/mark-paid`,
  PROCESSED -> PAID) row actions, gated `PAYROLL_PROCESS`/`PAYROLL_MARK_PAID` respectively — two
  separate permissions per the backend's own design, render as two separate buttons that
  appear/disappear based on the record's current status, not one combined action.

`PAYROLL_READ` (the full company-wide list) is also held by OA, not just SA — wire this page into
whatever portal OA actually uses (Super Admin portal, confirmed by every prior phase) and gate the
generate/process/mark-paid actions correctly so OA sees the list but not those buttons (OA holds
`PAYROLL_READ` but not `PAYROLL_PROCESS`/`_MANAGE`/`_MARK_PAID` — confirmed against seedRoles.js).
```

**Acceptance criteria:** a real payroll record is generated, processed, and marked paid through
the UI, each transition backend-confirmed; OA sees the company-wide list but never sees
generate/process/mark-paid controls (permission-gated, not role-name-gated).

---

## Stop and report

After Prompt 19.3, generate a real payroll record for a real employee, process it, mark it paid,
and confirm it now shows correctly in that employee's own My Payroll history with the right
snapshotted figures.

## Phase F19 exit criteria

- Every role can see their own payroll history with accurate snapshotted (not live) figures.
- SA can generate (single + bulk), process, and mark payroll paid.
- OA can see the company-wide payroll list (read-only) without seeing admin action buttons it
  doesn't hold permission for.
