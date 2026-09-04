# Frontend Migration Phase 2 — Unified Portal Access

**Depends on:** Phase F01. **Type:** routing/layout change, deliberately NOT a rewrite.
**Blocks:** every later phase — nothing built in F03 onward is reachable by a new role until this
phase lands.

**Design decision — read this before starting:** the instinct to fully merge the three existing
portals (`super-admin/`, `sales-manager/`, `employee/`) into one generic shell right now is
understandable but WRONG for this phase. Each portal already has dozens of working, permission-
gated pages (employee/category/product/inventory/CRM/quotation lists, create/edit forms, detail
views). Rewriting all of that now, before any new role has even logged in once, is high-risk for no
immediate benefit. The actual blocker today is much smaller: the three `ProtectedRoute
allowedRoles={[...]}` arrays and one routing function only recognize the 3 legacy role strings.
Widen those, and the new roles get a fully working portal *for free*, reusing every page that
already exists — because the pages themselves are already permission/scope-driven, not role-name-
driven (confirmed in Phase F00's audit). A full shell consolidation, if ever wanted, is a much
later, optional cleanup (see `frontend-phase-15-shell-consolidation.md`) — it is explicitly NOT a
dependency for anything else in this plan.

**Which new role goes to which existing portal** (based on shape of the job, not job title):
- **SA, OA** -> the `super-admin/` tree (company-wide/administrative shape). OA's narrower
  permission set (it doesn't hold the `"*"` wildcard SA does) is already correctly enforced by each
  page's own `withPermission()`/`PermissionGuard` checks — OA will simply see fewer nav items and
  get 403'd out of a few actions, which is correct and requires no new code.
- **GM, RM, ASM, SO** -> the `sales-manager/` tree (team-oversight shape — SO manages FOs, so it
  belongs here too, not in the individual-contributor tree).
- **FO** -> the `employee/` tree (individual-contributor, self-service shape).

---

## Prompt 2.1 — Widen the three route gates

```
Open `src/routes/SuperAdminRoutes.jsx`, `src/routes/SalesManagerRoutes.jsx`,
`src/routes/EmployeeRoutes.jsx`. Each has one `ProtectedRoute allowedRoles={[BACKEND_ROLES.X]}` at
its root. Widen each array using Phase F01's new `BACKEND_ROLES` entries:

  SuperAdminRoutes:   allowedRoles={[BACKEND_ROLES.SUPER_ADMIN, BACKEND_ROLES.SA, BACKEND_ROLES.OA]}
  SalesManagerRoutes: allowedRoles={[BACKEND_ROLES.SALES_MANAGER, BACKEND_ROLES.GM,
                                     BACKEND_ROLES.RM, BACKEND_ROLES.ASM, BACKEND_ROLES.SO]}
  EmployeeRoutes:     allowedRoles={[BACKEND_ROLES.EMPLOYEE, BACKEND_ROLES.FO]}

Do not touch anything else in these three files this prompt — no new pages, no new nav items yet.
```

**Acceptance criteria:** a user logged in as GM/RM/ASM/SO can reach every route under
`/sales-manager/*` that a SALES_MANAGER user can; SA/OA reach `/super-admin/*`; FO reaches
`/employee/*`; a cross-attempt (e.g. an FO hitting `/super-admin/*`) still redirects to
Unauthorized exactly as it does today for EMPLOYEE.

---

## Prompt 2.2 — Fix the post-login portal routing function

```
Open `src/core/auth/authRoutes.js`. `getPortalRouteForRole` if/else-checks the exact 3 legacy role
strings and falls through to `ROUTES.ERROR.UNAUTHORIZED` for anything else — today, that includes
all 7 new roles, meaning a GM logging in successfully still lands on an error page.

Extend the if/else (or convert to a lookup table, whichever keeps the file more readable — your
call) to route:
  SA, OA          -> ROUTES.SUPER_ADMIN.DASHBOARD
  GM, RM, ASM, SO -> ROUTES.SALES_MANAGER.DASHBOARD
  FO              -> ROUTES.EMPLOYEE.DASHBOARD
alongside the existing 3 legacy mappings (unchanged).
```

**Acceptance criteria:** logging in as any of the 7 new roles lands on the correct dashboard, not
Unauthorized.

---

## Prompt 2.3 — Fix the shared layout's role-to-navigation map

```
Open `src/shared/layouts/RoleAwareInternalLayout.jsx`. It currently maps exactly the 3 legacy roles
to a navigation array + portal label, defaulting anything else to the Employee nav/label. Extend
its `layoutConfig` the same three-way grouping as Prompt 2.1 (SA/OA -> superAdminNavigation +
"Super Admin Portal"; GM/RM/ASM/SO -> salesManagerNavigation + "Sales Manager Portal"; FO ->
employeeNavigation + "Employee Portal"), alongside the existing 3 legacy mappings.

This component today is only wired into `AccountRoutes.jsx` for the shared Change-Password page —
confirm that's still true (grep for other usages) and don't expand its usage elsewhere this
prompt; that's out of scope here.

While you're in the three navigation array files (`super-admin/navigation/superAdminNavigation.js`,
`sales-manager/navigation/salesManagerNavigation.js`, `employee/navigation/employeeNavigation.js`),
do NOT add any new items yet — Phases F03 onward each add their own nav entries as their features
land. This prompt is routing/labeling only.
```

**Acceptance criteria:** the Change-Password page (and anything else routed through
`RoleAwareInternalLayout`) shows the correct nav/label for all 7 roles, not just the legacy 3.

---

## Prompt 2.4 — Verify reused pages don't have hardcoded legacy-role copy

```
The `sales-manager/` and `employee/` page trees were written when only SALES_MANAGER/EMPLOYEE could
ever see them. Grep both trees (`src/sales-manager/`, `src/employee/`) for the literal strings
"Sales Manager" and "Employee" appearing in JSX text/labels (not import paths, not component names)
— these are the places a GM or an FO would see a confusing, wrong label today. For each hit, decide:
if it's genuinely generic copy that reads fine regardless of who's viewing it, leave it; if it says
something like "As your Sales Manager..." that would read oddly for a GM, make it role-neutral
(e.g. "As your manager..." or pull the actual `ROLE_LABELS[role]` value instead of a hardcoded
string).

Report every hit and what you did with it — don't silently rewrite copy that was actually fine.
```

**Acceptance criteria:** no page under `sales-manager/` or `employee/` displays a legacy-role-
specific label to a new-role user in a way that reads as wrong or confusing.

---

## Prompt 2.5 — Clean up stale mocks

```
Every feature's mock toggle (`VITE_USE_AUTH_MOCK`, `VITE_USE_EMPLOYEE_MOCK`, `VITE_USE_PHASE3_MOCK`,
`VITE_USE_PHASE4_MOCK`) defaults to off and the app runs against the real backend everywhere. These
were dev-phase scaffolding for backend phases that are now real and verified. Remove the mock
import/branch from each `*Api.js` file that has one (`authApi.js`, `employeeApi.js`,
`categoryApi.js`, `productApi.js`, `inventoryApi.js`, `leadApi.js`, `leadActivityApi.js`) and delete
the corresponding files under `src/mocks/`. Also remove the now-dead `VITE_USE_*_MOCK` entries from
`.env.example`.

Do this LAST in this phase, after Prompts 2.1-2.4 are verified working — if something unexpectedly
still depends on a mock (e.g. a Storybook-less visual check someone was using), you want to find
that with the real backend already proven to work end-to-end, not while still debugging the
routing change.
```

**Acceptance criteria:** no `VITE_USE_*_MOCK` flags or `src/mocks/*.mock.js` files remain; the app
still runs correctly for all 7 roles against the real backend.

---

## Stop and report

After Prompt 2.5, start `npm run dev`, log in as one seeded user per role (use the backend's
Phase 5/7 demo-seed data — `npm run seed:phase5-demo`/`seed:phase7-demo` in the backend repo, or
whatever demo seed currently exists for all 7 roles) and confirm each lands on a working dashboard
with a sensible nav menu. Report which roles you could actually test (some may have no seeded demo
user yet) and which you only verified by code inspection.

## Phase F02 exit criteria

- All 7 roles can log in and reach a working, correctly-labeled portal reusing the existing 3
  page-trees — no new folders were created.
- Stale mocks are removed.

---

## IMPLEMENTED AND VERIFIED

**Prompts 2.1-2.3** implemented as written: all three `ProtectedRoute allowedRoles` arrays widened,
`getPortalRouteForRole` extended, `RoleAwareInternalLayout`'s role→nav map extended.

**Prompt 2.4 finding — bigger than the prompt anticipated.** The grep found the obvious hardcoded
`"Sales Manager"`/`"Employee"` text hits, but the ACTUAL bug was one level deeper: the three
`XLayout.jsx` wrapper components (`SuperAdminLayout.jsx`, `SalesManagerLayout.jsx`,
`EmployeeLayout.jsx`) each hardcode their own `portalLabel` string prop passed to
`InternalAppLayout` — completely separate from `RoleAwareInternalLayout`'s map (which Prompt 2.3
fixed but which turned out to only be wired into the shared Change-Password route, exactly as
Phase F00's audit had flagged). Since the three MAIN portal routes render their own `XLayout`
directly, Prompt 2.3's fix alone would never have shown a GM/RM/ASM/SO a correct label anywhere
except the Change-Password page. Fixed by adding one new shared helper,
`getPortalLabelForRole(roleName)` (in `core/auth/authRoutes.js`, exported alongside
`getPortalRouteForRole`, since both are "map a role to a portal-shaped thing" and belong together)
that derives the label from `ROLE_LABELS` instead of a hardcoded string — used by all three
`XLayout.jsx` files plus the three page-level "eyebrow" labels that had the same hardcoded-string
problem (`SalesManagerTeamPage.jsx`, `EmployeeProfilePage.jsx`, `EmployeeProfileEditPage.jsx`).
Also made the three dashboard-shell pages' title/description role-neutral ("Manager Dashboard" /
"My Dashboard" / "Admin Dashboard") since they're currently trivial placeholder shells (Phase F12
replaces their content entirely) — not worth wiring a role lookup into code about to be rebuilt.

**Prompt 2.5:** removed all 8 `getMock*Api` helpers and their 57 call-site branches across
`authApi.js`, `employeeApi.js`, `categoryApi.js`, `productApi.js`, `inventoryApi.js`, `leadApi.js`,
`leadActivityApi.js` — plus two files not named in the original prompt but found carrying the same
`VITE_USE_PHASE3_MOCK` pattern: `modules/public/products/api/publicProducts.api.js` and
`modules/public/categories/api/publicCategories.api.js` (the public storefront's own catalog
fetchers). Deleted `src/mocks/` entirely and the four `VITE_USE_*_MOCK` lines from `.env.example`.
`env.js`'s now-unused `useAuthMock`/`useEmployeeMock` flags removed too (confirmed nothing else
read them).

**Verification:**
- `npm run build` — clean, no errors.
- Real browser (Playwright/Chromium) login test against the real dev backend, three accounts:
  legacy Super Admin (regression check — unchanged, lands on `/super-admin/dashboard`, "Super Admin
  Portal"), a temporary legacy Sales Manager account (regression check — unchanged, lands on
  `/manager/dashboard`, "Sales Manager Portal"), and a temporary **GM** account (the actual new
  capability — lands on `/manager/dashboard`, portal label correctly reads "General Manager
  Portal", full Sales Manager nav visible: Dashboard/My Team/CRM/Leads/Follow-Ups/Quotations).
  Screenshot confirmed the GM case visually — correct label in both the sidebar brand block and the
  header eyebrow, correct role shown in the profile menu ("General Manager"). All 3/3 checks passed.
- Both temporary test accounts were created directly (no Hiring workflow exists yet to create them
  through) and deleted immediately after the run — no leftover data.
- `git status` confirms only the intended files changed in each repo; no throwaway scripts left
  behind in either the frontend or backend working tree.

**POST-HOC CORRECTION (found while starting Phase F03):** the mock-removal in Prompt 2.5 was
incomplete. My cleanup script only matched a two-line `const mock = ...; if (mock) return
mock.x(...);` pattern; several call sites had an extra payload-building line between those two,
so the `getMock*Api()` reference survived while the helper function itself was deleted underneath
it — a live `ReferenceError` on every call. This was **not caught by `npm run build`** (a runtime
reference error, not a type/syntax error) and was missed by Phase F02's own browser verification
because that pass only exercised login/routing, never the affected actions. Affected and fixed:
`leadApi.js` (8 call sites: `submitPublicEnquiry`, `createLead`, `updateLead`, `changeStatus`,
`changePriority`, `scheduleFollowUp`, `completeFollowUp`, `reopenLead`), `leadActivityApi.js`
(`createManualActivity`), `productApi.js` (`changeProductStatus`), `categoryApi.js`
(`changeCategoryStatus`), and — most seriously, since these are unauthenticated and load on every
public-site visit — `modules/public/products/api/publicProducts.api.js`
(`getPublicProducts`/`getPublicProductBySlug`) and
`modules/public/categories/api/publicCategories.api.js` (`getPublicCategories`). Re-verified with a
real browser against the public `/products` page: **46 real products, category filters with
correct counts, pagination all working** — confirmed broken before the fix (real
`ReferenceError: getMockPublicProductApi is not defined`, "Unable to load products" error state)
and confirmed fixed after. Lesson for future phases: `npm run build` passing is not sufficient
evidence for a mock/cleanup-style change — it must be exercised in a real browser, specifically
including the affected action, not just page-load/navigation.
