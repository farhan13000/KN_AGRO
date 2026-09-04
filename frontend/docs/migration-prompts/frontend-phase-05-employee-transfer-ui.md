# Frontend Migration Phase 5 — Employee Transfer UI

**Depends on:** Backend Phase 6 (done). Frontend Phase F04. **Type:** new feature, small.

---

## Prompt 5.1 — Transfer API, action dialog, and history list

```
Add `EMPLOYEE_TRANSFER` endpoints to `apiConfig.js`
(`POST /employees/:employeeId/transfer`, `GET /employees/:employeeId/transfers` — confirmed exact
paths from `BACKEND/backend/src/modules/employees/employee.routes.js`).

Add to `src/features/employees/services/employeeApi.js`: `transferEmployee(employeeId, {toManager,
toRegion, toDistrict, reason, effectiveAt})`, `listTransfers(employeeId, query)`.

Create `src/features/employees/components/TransferEmployeeDialog.jsx` — a form with: new manager
(candidate list from the SAME `MANAGER_TIER_ROLES`-filtered query Phase F01 fixed in
`ManagerAssignmentDialog`; consider extracting that filtering logic into a shared hook,
`useEligibleManagerCandidates`, since both dialogs now need the identical query+filter — check if
duplicating the ~10 lines is simpler than the extraction before deciding, this is a judgment call,
not a hard requirement), new region, new district (independently optional fields, matching the
backend's model — a transfer can change any subset of manager/region/district, not all three), a
reason field (required), and an optional effective-date field. Gate visibility of the "Transfer"
button on the employee detail page behind `PERMISSIONS.EMPLOYEES_TRANSFER`.

Create `src/features/employees/components/TransferHistoryList.jsx` — a read-only, reverse-
chronological list of past transfers (from/to manager, from/to region, from/to district, reason,
effective date, who performed it) shown as a new tab/section on
`SuperAdminEmployeeDetailPage`/its Sales-Manager-tree equivalent, gated behind `EMPLOYEES_READ`
(same permission as viewing the employee at all — transfer history isn't more sensitive than the
rest of the profile per the backend's own routing).
```

**Acceptance criteria:** a transfer changing only the manager (region/district left as "no change")
succeeds and shows correctly in history; a transfer attempting an invalid manager (wrong tier, per
backend's `validateReportingRelationship`) surfaces the backend's specific rejection message, not a
generic error.

---

## Stop and report

After Prompt 5.1, perform one real transfer through the UI (change an employee's manager) and
confirm it appears correctly in that employee's Transfer History tab, then confirm their position
in Phase F04's hierarchy tree actually moved.

## Phase F05 exit criteria

- An employee can be transferred (manager/region/district, independently) through the UI, and the
  resulting history is visible.

---

## IMPLEMENTED AND VERIFIED

**Built:** `TRANSFER`/`TRANSFERS` endpoints in `apiConfig.js`; `transferEmployee` + `listTransfers`
in `employeeApi.js`; `transferEmployee` added to `useEmployeeActions`; a `useEmployeeTransfers`
hook; `TransferEmployeeDialog.jsx` and `TransferHistoryList.jsx`. The Transfer button
(gated by `EMPLOYEES_TRANSFER`) and the history section (gated only by being able to view the
employee at all, matching the backend's own `EMPLOYEES_READ` route) are wired into
`SuperAdminEmployeeDetailPage`, and the history also appears on
`SalesManagerTeamMemberDetailPage`.

Manager/region/district are each independently optional in the dialog: anything left on
"No change" is simply omitted from the payload, since the backend distinguishes *omitted*
(unchanged) from an explicit *null* (cleared). Changing the region resets the district selection,
because `districtsForRegion` (from F04) only offers districts inside the chosen region.

**Judgment call the prompt left open — extraction, not duplication.** `useEligibleManagerCandidates`
was extracted and is now used by both `ManagerAssignmentDialog` and the new transfer dialog. It was
worth more than the ~10 saved lines: building it on `useAllEmployees` also **fixes the 100-row
truncation flagged in F03's notes** — `ManagerAssignmentDialog` previously fetched a single
100-row page, so with 101+ active employees valid managers could silently be missing from its
dropdown. Both dialogs now page through the full list.

**Bug found and fixed — the shared `Modal` could not scroll.** `Modal.jsx` had no max-height and
no overflow handling, so any dialog taller than the viewport pushed its own submit buttons
off-screen with no way to reach them. The transfer form (three selects + reason + date, plus an
error message) was the first dialog long enough to hit it — it was literally impossible to submit.
Fixed at the shared component: the panel is now capped to the viewport with a fixed header and a
scrollable body, which benefits every dialog in the app, not just this one.

**Verification:** real browser (Playwright/Chromium) against the live dev backend, using a purpose-
built org (`GM → RM1 → {ASM, wrong-tier SO}`, plus `RM2` under the same GM). **10/10 checks passed,
zero page errors:**

- History section renders and correctly reads "No transfers recorded" for a never-transferred
  employee; the Transfer button shows for an actor holding `employees.transfer`.
- **Wrong-tier manager is rejected with the backend's own specific message** — the UI surfaced
  *"A asm must report to a rm, not a so"* verbatim from `validateReportingRelationship`, not a
  generic failure.
- A **manager-only** transfer (region/district left as "No change") succeeded.
- History then showed the reason, the `F05TRM1 → F05TRM2` manager change, who performed it and
  when, and — importantly — **no fabricated region/district rows** for the fields that transfer
  didn't touch.
- The F04 hierarchy tree independently confirmed the move: the ASM now nests under RM2.

All test employees, users, transfer records, the test region and district were deleted afterwards;
both repos show only intended files.
