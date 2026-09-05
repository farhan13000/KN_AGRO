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

---

## IMPLEMENTED AND VERIFIED

### Money units — verified, not assumed (Prompt 19.1's explicit requirement)

`payroll.serializer.js` runs **every** money field through `toRupees()` on the way out, and
`PayrollService.updatePayrollDraft` applies `toPaise()` to incoming values. So payroll is **rupees
in both directions** and the frontend performs **no conversion at all** — different from
SalaryProposal (F08, no auto-convert) and matching DSR (F10). This is recorded in `payrollApi.js`
itself so the next module doesn't copy the wrong precedent.

### Routes

`POST /generate`, `POST /generate-bulk`, `GET /me`, `GET /`, `POST /:id/process`,
`POST /:id/mark-paid`, plus `PATCH /:id` (DRAFT-only privileged edit — exists but wasn't in the
prompt's list) and `GET /:id`, which carries **no `authorize()` middleware**: `getPayrollById`
checks in-service for `PAYROLL_READ`/wildcard *or* `PAYROLL_READ_SELF` limited to the caller's own
record.

`generateBulkPayrollSchema` takes `{month, year, manager?, department?}` — **omitting both filters
targets every ACTIVE employee**, which the dialog states in plain words before you submit, since
that is a large action. Neither generate endpoint accepts any financial field; everything is
server-computed.

### Built

`features/payroll/` (api, hooks, constants, `PayrollStatusBadge`, `PayslipBreakdown`,
`MyPayrollView`, `AllPayrollView`, `PayrollGenerateDialog`), plus pages: **My Payroll in all three
portals** (every seeded role holds `PAYROLL_READ_SELF`) and **Payroll Runs** in the Super Admin
portal. Nav entries and `PAYROLL_READ`/`PAYROLL_PROCESS`/`PAYROLL_MARK_PAID`/`PAYROLL_MANAGE`
constants added.

`PayslipBreakdown` renders the record's **own frozen** `salaryStructureSnapshot` /
`attendanceSummary` — never the employee's currently-active structure, which would misrepresent what
they were actually paid if their salary has since changed.

**Two gaps closed as a side effect:**
- The F12 dashboard "Latest Payroll" readout now **links to** the full history (kept, not replaced,
  as the prompt required).
- `VIEW_PAYROLL` notifications had **no destination** — a gap F10 flagged and F13 re-confirmed.
  They now resolve to the recipient's own My Payroll.

### Verification

Real browser (Playwright/Chromium), live backend. **19/19 checks passed, zero page errors.**

- **SA**: generated a payroll (DRAFT) → gross ₹45,000 matching the snapshotted structure →
  **Process** → Process button disappears → **Mark Paid** → record shows Paid.
- **OA**: sees the company-wide list but **none** of Generate / Process / Mark Paid — gated purely
  by permission, with no role-name special-casing anywhere in the view.
- **The employee**: opened My Payroll and saw March 2026 with correct snapshotted figures — Basic
  ₹30,000, HRA ₹12,000, Travel ₹3,000, gross ₹45,000, PF ₹3,600, **net ₹41,400**.

Two checks failed on the first run. **Both were bad test data, not app defects:** the seeded
SalaryStructure used a `fixedDeductions` field, but the model's field is **`deductions`** — Mongoose
silently dropped it, so the structure genuinely had no deductions to snapshot. (The backend's own
mapping, `fixedDeductions: structure.deductions`, is correct.) After fixing the seed, all 19 passed.
All test scaffolding (payroll, salary structure, employee record) was removed; the permanent
`fo-demo` demo login was kept.

### Follow-up — "no employee profile" is not an error (2026-09-05)

Reported from a live session: signing in as `fo-demo` and opening **My Payroll** produced a red
**"Unable to load payroll — No employee profile exists for this account"** banner.

The data and the backend were both correct. Every `*-demo` login (`sa`/`oa`/`gm`/`rm`/`asm`/`so`/`fo`)
is a login-only fixture with no Employee record, so `GET /payroll/me` rightly answers 404. The
defect was **presentational and inconsistent**: Phase 21 had already established that this exact 404
is a legitimate state (My Profile renders a calm empty state for it), but this screen still treated
it as a failure.

`GET /employees/me`, `/payroll/me` and `/salary/me` all throw the identical 404, so the test for it
now lives in one place — `features/employees/utils/employeeErrors.js` —
rather than being repeated as a literal status check in three components:

```js
export const isMissingEmployeeProfileError = (error) => error?.status === 404;
```

(`error.status`, not `error.response.status`: apiClient normalizes every failure into a
`FrontendApiError`.)

`MyPayrollView` now renders an EmptyState for that case and reserves `ErrorState` for genuine
failures. The two empty states stay distinct and must not be collapsed into one — they answer
different questions:

- **no employee record** → "No employee profile for this account"
- **an employee with no payslips yet** → "No payroll records"

**IMPLEMENTED AND VERIFIED.** Real browser (Playwright/Chromium), live backend, **10/10 checks
passed, zero page errors** — covering this doc's screen and Phase 21's:

- **`fo-demo`** (no Employee record): My Payroll shows the calm no-profile state, no red banner, and
  does *not* additionally render "No payroll records".
- **A real FO** (`yash.menon@demo.knagro.local`, who has an Employee record but no payslips): still
  gets "No payroll records" — confirming the new branch does not swallow the ordinary empty case.
