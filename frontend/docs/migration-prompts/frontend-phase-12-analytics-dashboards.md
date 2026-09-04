# Frontend Migration Phase 12 — Analytics Dashboards Per Role Tier

**Depends on:** Backend Phase 14. Frontend Phases F02, F09, F10. **Type:** extend existing dashboard
shells.

**Read first:** the backend already separates "which dashboard TIER" from "which DOMAIN sections"
(`ANALYTICS_MANAGER`/`ANALYTICS_EMPLOYEE` × `ANALYTICS_CRM_READ`/`ANALYTICS_SALES_READ`/etc.). This
phase extends that same split on the frontend — it does not invent a new dashboard architecture.

---

## Prompt 12.1 — Confirm existing dashboard sections already call scoped endpoints

```
Open whatever currently renders `SuperAdminDashboardPage`/`SalesManagerDashboardPage`/
`EmployeeDashboardPage` (confirmed by Phase F00 to currently be mostly trivial shells with static
copy, no real data — verify this is still accurate; if any section already fetches real data,
confirm it's calling through Phase F09/F10's already-scoped endpoints and not a separate,
unscoped aggregate).
```

**Acceptance criteria:** a documented confirmation of what's currently real vs. placeholder in each
dashboard shell.

---

## Prompt 12.2 — Build the 5 new role-tier dashboard variants

```
Per the backend's own Section 32 section list, build dashboard content for each new role
(reusing `SalesManagerDashboardPage`'s shell/layout for GM/RM/ASM, `EmployeeDashboardPage`'s shell
for SO/FO — same portal-reuse principle Phase F02 established, don't build 5 new dashboard page
files):

- FO: own leads, follow-ups, orders, sales, attendance, DSR, performance.
- SO: own sales, FO-team sales, FO leads, attendance, DSR, team performance.
- ASM: SO/FO performance, area sales, area leads, orders, attendance, DSR.
- RM: district performance, ASM performance, SO/FO performance, regional sales/leads/orders,
  attendance, DSR.
- GM: company-wide sales, regions, districts, employee performance, leads, conversion, orders,
  growth, attendance, DSR.

Every section calls an existing, already-scoped endpoint from Phases F09-F11 (lead scope, order
attribution, attendance, DSR, promotions/recommendations if relevant) — do not compute a new
aggregate client-side from a raw list; if a section has no existing endpoint to call, report it as
a gap rather than building a workaround.

Since role → section-list is now genuinely role-based content (not just permission-filtered), it's
fine for this ONE component to branch on `role` for which section list to render — this is a
legitimate display-shape decision (which widgets show), not an access-control decision (each
individual section's own data-fetch remains permission/scope-gated exactly as it already is).
```

**Acceptance criteria:** each of the 5 roles sees a dashboard with the sections listed above,
every number traceable to a real endpoint call.

---

## Stop and report

After Prompt 12.2, report which sections (if any) had no existing endpoint to call and had to be
skipped/flagged rather than built.

## Phase F12 exit criteria

- All 7 roles (3 legacy + 5 new) get a dashboard shaped for their tier, backed entirely by real,
  already-scoped endpoints.

---

## IMPLEMENTED AND VERIFIED

**Prompt 12.1 finding:** confirmed via source read (not just Phase F00's prior audit) —
`SuperAdminDashboardPage`, `SalesManagerDashboardPage`, and `EmployeeDashboardPage` were all still
trivial `DashboardShell`-only placeholders (static copy, zero data-fetching), **except**
`SalesManagerDashboardPage`, which already had Phase F09's `OrderAttributionWidget` wired in — a real,
correctly-scoped call to `orders.analytics.read`. That widget was left untouched and is now
positioned above this phase's new content, not replaced or duplicated.

**Real design finding, disclosed before building anything:** this phase's own "no existing endpoint →
report a gap" instruction turned out not to apply — reading `backend/src/modules/analytics/
dashboard.service.js` end-to-end (832 lines) up front showed a **pre-existing central analytics
module** (originally built pre-migration, extended in Backend Phase 14 specifically to wire DSR into
every dashboard tier) already implements 4 composite dashboard endpoints — `/analytics/admin/
dashboard` (`ANALYTICS_ADMIN`), `/analytics/manager/dashboard` (`ANALYTICS_MANAGER`), `/analytics/
employee/dashboard` (`ANALYTICS_EMPLOYEE`), `/analytics/so/dashboard` (`ANALYTICS_EMPLOYEE`,
role-narrowed server-side) — that between them cover every item on this prompt's own FO/SO/ASM/RM/GM
section lists, attendance and DSR included. **Nothing had to be skipped or flagged as a gap** — the
direct answer to the Stop-and-report's question.

Backend permission distribution (confirmed against `seedRoles.js`): legacy `SALES_MANAGER` + GM + RM
+ ASM hold `ANALYTICS_MANAGER` (all four share the exact same endpoint and response shape — scoped
automatically to each actor's own downline by `resolveAnalyticsScope`, only the numbers differ by
tier); legacy `EMPLOYEE` + SO + FO hold `ANALYTICS_EMPLOYEE`; SO additionally gets its own `/so/
dashboard` variant (the backend's own deliberate "SO doesn't fit either tier cleanly" design); OA
holds neither (no dashboard tier at all — an explicit backend comment confirms this is intentional,
not an oversight).

**One disclosed, real gap (not fabricated around):** the prompt's GM wishlist adds "regions,
districts, growth" on top of what SO/ASM/RM see. The single shared Manager Dashboard endpoint does
not break those out as distinct region/district-level sections or expose a trend/growth metric —
confirmed by reading its full JSDoc contract, not assumed. Documented in `ManagerDashboardContent.jsx`
itself and here rather than silently invented or silently dropped.

**Built:** `ANALYTICS_ADMIN`/`ANALYTICS_MANAGER`/`ANALYTICS_EMPLOYEE`/`PAYROLL_READ_SELF` permission
constants added (confirmed deferred by Phase F01). `src/features/analytics/` — `analyticsApi.js` (4
thin GETs matching the routes above exactly), `useAnalyticsQueries.js` (`useAsyncResource` wrappers),
`DashboardPrimitives.jsx` (`StatGrid`/`Stat`/`Section`/`KeyValueRow`, shared by all 4 content
components to avoid 4x duplicated layout code), and one content component per dashboard contract:
`AdminDashboardContent`, `ManagerDashboardContent` (shared by GM/RM/ASM/legacy SALES_MANAGER),
`SalesOfficerDashboardContent`, `EmployeeDashboardContent` (FO/legacy EMPLOYEE). No new dashboard
page files — `SalesManagerDashboardPage` branches on **which permission is held**
(`ANALYTICS_MANAGER` vs `ANALYTICS_EMPLOYEE`) to pick Manager vs. SO content, matching this phase's own
explicitly-allowed exception (display-shape decision, not access control).

**Two real shape bugs caught and fixed** by curling each live endpoint before trusting the render code
(not assumptions from reading aggregation source alone): `leadFunnel.funnel` is an **array** of
`{status, count}`, not the flat object the raw `$group` code initially suggested — fixed in both
`ManagerDashboardContent.jsx` and `AdminDashboardContent.jsx`. `leaves.upcoming` in the Employee
Dashboard is an **array** of leave objects, not a count — fixed in `EmployeeDashboardContent.jsx`
(`?.length ?? 0`). Every other field referenced by all 4 components (`kpis.*`, `pendingActions.*`,
`topProducts[]`, `topCustomers[]`, `employees.managerPerformance[]`, `recentActivity[]`,
`followUps.*`, `team.attendance.*`, `dsr.*`, `inventoryAlerts.*`, `employeePerformance[]`,
`own.*`/`team.performance.*` for SO, `attendanceToday.*`/`attendanceMonth.*`/`payroll.*` for FO — note
SO's `attendanceToday.status` and FO's `attendanceToday.todayStatus` are genuinely different key names
between the two dashboard contracts, both rendered correctly) was cross-checked against real curled
payloads from all four live endpoints and matched exactly.

**Verification:** real browser (Playwright/Chromium) against the live dev backend and the real Phase
17 seeded org (62-employee GM→RM→ASM→SO→FO hierarchy) — **22/22 checks passed** across all 4 tiers:

- SA (`admin@example.com`): admin dashboard renders KPIs, Lead Funnel, Manager Performance table,
  Pending Actions, Recent Activity.
- GM (`aarav.kulkarni@demo.knagro.local`, real 30-person downline): manager dashboard renders KPIs,
  Team Attendance, Team DSRs, Inventory Alerts, and a 30-row Team Performance table.
- SO (`yash.bhatt@demo.knagro.local`, real 2-person FO team): SO dashboard renders My Own Sales, My FO
  Team, Team Performance, My DSRs, Team DSRs — and confirmed it does **not** see the full Manager
  Dashboard KPI grid (`Pipeline Value` absent), verifying the permission-based branch actually
  discriminates.
- FO (`vivaan.kapoor@demo.knagro.local`): employee dashboard renders Assigned Leads, Attendance, Daily
  Sales Reports, Leaves & Reports, Latest Payroll.
- Zero uncaught page errors across all four personas.

**Cleanup confirmed:** `tmp-verify-phase12.mjs` deleted, `playwright` uninstalled,
`package-lock.json` reverted. `npm run build` — clean, no errors.
