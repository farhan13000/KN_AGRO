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
