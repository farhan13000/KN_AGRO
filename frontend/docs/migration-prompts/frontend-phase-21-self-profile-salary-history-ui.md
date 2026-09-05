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
