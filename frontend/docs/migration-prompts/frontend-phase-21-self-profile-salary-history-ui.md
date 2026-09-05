# Frontend Migration Phase 21 — Universal Self-Profile, My Salary, and Salary History

**Depends on:** Backend Phase 9 (`salary` module — already built, verified, live). Frontend Phase
F13 (Notifications — where this gap first surfaced: a `VIEW_MY_PROFILE`/promotion/transfer
notification for a GM/RM/ASM/SO/SA/OA has nowhere to deep-link to). **Type:** two small, real,
independently-disclosed gaps bundled into one phase since both are narrow and fast to close: (1)
only the Employee portal has a "My Profile" page — SA/OA/GM/RM/ASM/SO have none; (2) salary data
has two unused self-service endpoints (`GET /salary/me`, `GET /:employeeId/history`) — only a
manager/SA-facing "current salary of someone else" card exists today.

---

## Prompt 21.1 — Self-profile for the Super Admin and Sales Manager portals

```
The Employee portal already has a real, working "My Profile" page
(`src/employee/pages/profile/EmployeeProfilePage.jsx`, backed by `useMyEmployeeProfile` and
`EmployeeDetailSections` from `features/employees`) — reuse these directly, don't rebuild them.
Add `SuperAdminMyProfilePage.jsx` and `SalesManagerMyProfilePage.jsx` as thin wrappers around the
exact same `useMyEmployeeProfile`/`EmployeeDetailSections` pair (same pattern this whole plan uses
everywhere else: one shared feature-level implementation, thin portal wrappers).

Note SA and OA hold no Employee record in this seeded org (confirmed throughout this plan — OA "no
Employee record... sits outside the sales hierarchy," and no seeded SA/SUPER_ADMIN account has one
either) — `useMyEmployeeProfile` will legitimately 404/return nothing for them. Handle this
gracefully (an EmptyState explaining "no employee profile exists for this account," not a crash),
don't fabricate a placeholder profile. GM/RM/ASM/SO all have real Employee records from Phase 17's
seeding and should see their real profile correctly.

Add a "My Profile" nav entry (gated `EMPLOYEES_READ_SELF`, same permission the Employee portal's
own nav entry already uses) to both the Super Admin and Sales Manager portal navigation arrays.
```

**Acceptance criteria:** a real GM/RM/ASM/SO sees their own real profile; SA/OA see a clear,
correct "no employee profile" state, not an error or a blank page.

---

## Prompt 21.2 — Close the notification deep-link gap

```
Go back to `src/features/notifications/utils/notificationDestination.js`. `VIEW_MY_PROFILE`
currently only resolves for the Employee portal (`routes.PROFILE`, returns null for the other two).
Now that Prompt 21.1 gives Super Admin and Sales Manager portals their own "My Profile" route, add
those routes to `ROUTES.SUPER_ADMIN`/`ROUTES.SALES_MANAGER` in `routes.constants.js` and wire
`VIEW_MY_PROFILE`'s resolver to use them — this closes a gap Phase F13 explicitly disclosed rather
than guessed around.
```

**Acceptance criteria:** a real promotion or transfer notification for a GM/RM/ASM/SO now
deep-links to their own real profile page instead of resolving to no destination.

---

## Prompt 21.3 — My Salary (self-service) and Salary History

```
Add `SALARY.ME` (`/salary/me`, gated `SALARY_READ_SELF` — held by every seeded role with an
Employee record) and `SALARY.HISTORY` (`/salary/:employeeId/history`, gated `SALARY_READ` — OA +
SA wildcard only, confirmed against seedRoles.js, do not widen this to manager tiers) to
`apiConfig.js`. Both are currently completely unused — verify this is still true before building
(`grep` the frontend for "salary/me" and "history" under `features/salary`) in case something
changed since this doc was written.

Build a "My Salary" section on each portal's own new My Profile page (Prompt 21.1's pages, plus the
existing Employee one) calling `GET /salary/me` — reuse `CurrentSalaryCard`'s own rendering
approach (check it directly for the paise/rupees conversion it already established) rather than
inventing a new money-display pattern for what is structurally the same data, just self-scoped
instead of viewed-about-someone-else.

Add a "Salary History" section to `CurrentSalaryCard`'s existing placement on the Employee Detail
page (`GET /:employeeId/history`, gated `SALARY_READ`) — a simple list of past structure changes
with effective dates, alongside the current-structure card it already sits next to, not replacing
it.
```

**Acceptance criteria:** a real employee sees their own current salary via the new self-service
endpoint; a real Employee Detail page (viewed by OA/SA) now also shows that employee's salary
change history, not just their current figure.

---

## Stop and report

After Prompt 21.3, confirm as a real GM: their own My Profile page renders with a working My
Salary section, and a promotion notification for them now deep-links correctly. Confirm as SA: an
Employee Detail page now shows both current salary and salary history.

## Phase F21 exit criteria

- All 7 new-hierarchy roles (SA, OA, GM, RM, ASM, SO, FO) can reach a "My Profile" page from their
  own portal, with SA/OA correctly showing "no employee profile" rather than crashing.
- The `VIEW_MY_PROFILE` notification deep-link works for every portal, closing Phase F13's own
  disclosed gap.
- Every role can see their own current salary; OA/SA can see any employee's salary history.

---

## IMPLEMENTED AND VERIFIED

### Built

- `MyProfileView` — **one** self-profile implementation in `features/employees`, with thin wrapper
  pages for all three portals. The Employee portal's existing page was migrated onto it too, keeping
  only its "Edit Profile" action (passed in as `actions`), so there is now a single implementation
  rather than one shared + one bespoke.
- `MySalaryCard` (`GET /salary/me`) rendered inside every My Profile page, and `SalaryHistoryList`
  (`GET /salary/:employeeId/history`) alongside the existing `CurrentSalaryCard` on the Employee
  Detail page, both behind `SALARY_READ`. Both endpoints were confirmed unused before building.
- `VIEW_MY_PROFILE` notifications now resolve in every portal (`routes.PROFILE || routes.MY_PROFILE`),
  closing the gap Phase F13 disclosed.

Money needs no conversion: the salary serializer already returns rupees, exactly as `salaryApi.js`'s
existing note recorded.

### Backend gap found — and since fixed

The exit criterion above expects **OA** to reach My Profile and see a "no employee profile" state.
Initially it couldn't, and this was **not** a frontend defect: **OA did not hold
`EMPLOYEES_READ_SELF`** in `seedRoles.js` (it held `EMPLOYEES_READ` and `SALARY_READ`, but not the
self permission). The prompt specified gating on `EMPLOYEES_READ_SELF`, so the route and nav entry
correctly denied OA.

The frontend gate was deliberately **not** widened to paper over the permission bundle. Instead the
backend was corrected: an audit showed **OA was the only role in the system missing this permission**
(SA and SUPER_ADMIN hold it via the `ALL_PERMISSIONS` wildcard; SALES_MANAGER, EMPLOYEE, GM, RM,
ASM, SO and FO all list it explicitly), so its absence was an inconsistency rather than a deliberate
restriction. `PERMISSIONS.EMPLOYEES_READ_SELF` was added to OA's bundle and applied to the live role
documents with `npm run sync:role-permissions` — the additive, idempotent path, since `seedRoles.js`
is deliberately non-destructive and never rewrites an already-seeded role. The sync touched exactly
one role: `oa: added 1 missing permission(s): employees.read_self`; every other role reported
"already up to date". No test depends on OA's permission list.

Re-verified in the browser afterwards — **7/7 checks, zero page errors**: OA's nav now shows My
Profile, the page renders instead of a 403, and it shows the correct "no employee profile" state;
SA and GM were re-checked for regressions and behave exactly as before.

OA legitimately has no Employee record of its own (it sits outside the sales chain), so the endpoint
answers "no employee profile exists for this account" — a meaningful answer rather than an access
denial. That is now the behaviour the exit criterion describes.

Also confirmed while testing: **none** of the seeded `sa/oa/gm/rm-demo` accounts have an Employee
record — they are login-only fixtures — so the "no employee profile" path is the norm for them, not
an edge case.

### Two real bugs found and fixed during verification

1. **Wrong error shape.** `MyProfileView` checked `error.response.status === 404` to detect "no
   employee record". This codebase normalizes every failure into a `FrontendApiError` whose status
   is on **`error.status`** — there is no `error.response`. SA therefore fell into the error branch
   and the page rendered no heading at all.
2. **Wrong response key.** `useSalaryHistory` read `data.structures`, but the controller returns the
   list as **`salaryStructures`** (`structures` is only the service's internal name), so history was
   always empty.

### Verification

Real browser (Playwright/Chromium), live backend, using a GM given two salary structures
(₹50,000 superseded → ₹60,000 active). **18/18 checks passed, zero page errors:**

- **GM**: nav entry present; My Profile shows their real employee record and a My Salary card with
  the **current** ₹60,000 and HRA ₹24,000 — and *not* the superseded ₹50,000.
- **SA**: gets the explicit "No employee profile for this account" state, no error banner.
- **OA**: initially denied (see the gap above); after the backend permission fix it reaches My
  Profile and shows the same correct "no employee profile" state as SA.
- **SA on Employee Detail**: sees Current Salary *and* the new Salary History — ₹60,000 labelled
  Current, ₹50,000 labelled Superseded.

Test scaffolding (the GM employee record and both salary structures) removed; the permanent
`gm-demo` login kept.

### Follow-up — the missing-profile check is now shared (2026-09-05)

This phase decided that a 404 from a `/me` endpoint means "this account has no Employee record",
which is a legitimate state rather than a failure. That rule was only applied to `MyProfileView`;
`MySalaryCard` still rendered a red **"Unable to load your salary"** banner for the identical
condition, and Phase 19's `MyPayrollView` did the same for payroll.

The check now lives in one place — `features/employees/utils/employeeErrors.js` — and all three
screens use it, so the rule cannot drift again:

```js
export const isMissingEmployeeProfileError = (error) => error?.status === 404;
```

`MySalaryCard` keeps its existing empty-state line and just varies the wording: an account with no
Employee record is told it has no salary structure *because* it has no employee record, while an
employee who simply has no structure yet keeps the original message.

**IMPLEMENTED AND VERIFIED** in the same 10/10 browser run recorded at the end of
`frontend-phase-19-payroll-ui.md`: as `fo-demo`, My Profile shows the no-profile empty state with
neither "Unable to load your profile" nor "Unable to load your salary" appearing anywhere.
