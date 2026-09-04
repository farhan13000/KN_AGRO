# Frontend Migration Phase 0 — Foundation Audit

**Status: complete. No prompts to run.**

This phase was the reconnaissance step: reading the entire frontend (`src/auth/`, `src/core/`,
`src/routes/`, `src/shared/`, `src/features/*`, `src/super-admin/`, `src/sales-manager/`,
`src/employee/`, `src/mocks/`) and mapping it against the backend's 7-role migration, to answer:
how auth/roles/permissions currently work, how routing and layout are structured per role, how the
API layer is organized, which features already couple to role/hierarchy shape, and what (if
anything) already anticipates the new roles/region/district/promotion/transfer concepts.

## Key findings this plan is built on

- **Auth/permissions are already backend-driven and role-agnostic at the primitive level**
  (`AuthContext.hasPermission()` checks `user.role.permissions[]` + the `"*"` wildcard) — this is
  the foundation every later phase leans on. The problems are all at a higher layer: routing,
  layout selection, and a handful of components that re-hardcode a role-name check the backend
  already enforces correctly.
- **Routing/layout/navigation are hardcoded per legacy role** in three parallel trees
  (`super-admin/`, `sales-manager/`, `employee/`), gated by `ProtectedRoute allowedRoles={[...]}`
  arrays listing the exact old role strings, plus a role-name if/else in
  `core/auth/authRoutes.js#getPortalRouteForRole` that falls through to the Unauthorized page for
  any role it doesn't recognize — today, that includes all 7 new roles.
- **A shared, permission-driven layout already exists** (`shared/layouts/InternalAppLayout.jsx`) and
  filters nav items by `hasPermission` — it's just under-used; the three portals each pass their own
  static nav array into it instead of sharing one.
- **Region, district, promotion (as a real workflow), transfer** have zero frontend footprint.
  Promotion exists only as a single hardcoded "promote to sales_manager via an env-var role id"
  action (`features/employees/components/EmployeeLifecycleDialog.jsx`,
  `core/config/env.js#salesManagerRoleId`).
- **Employee hierarchy UI is flat/2-tier** (`features/employees/components/EmployeeHierarchyTree.jsx`,
  `employeeApi.js#getEmployeeHierarchy`) — assumes exactly one manager level, will not represent a
  GM→RM→ASM→SO→FO chain correctly.
- **One real hardcoded business-rule violation found:**
  `features/employees/components/ManagerAssignmentDialog.jsx:37` filters candidate managers by
  `candidate.user?.role?.name === "sales_manager"` — a frontend re-implementation of the backend's
  `MANAGER_TIER_ROLES` concept that will silently exclude GM/RM/ASM/SO as valid managers once they
  exist.
- **Public self-registration still exists** (`auth/pages/EmployeeRegistration/`) — the frontend
  counterpart of the backend flow Phase 8 (Hiring Workflow) retires outright.
- **`shared/constants/permissions.constants.js` and `roles.constants.js` only know the old 3-role/
  old-permission-set world** — none of the backend's new permission strings (`region.*`,
  `district.*`, `employees.transfer`, `promotion.*`, `hiring.*`, `salary_proposal.*`, `dsr.*`,
  `products.recommend`) exist yet, and the existing `EMPLOYEES_PROMOTE`/`EMPLOYEES_PROMOTE_REQUEST`
  constants map to permission strings (`employees.promote`, `employees.promote_request`) that don't
  match the backend's actual Promotion-module permissions (`promotion.recommend/approve/reject/read`)
  at all — these are stale from before the Promotion module existed.
- **Mocks are stale scaffolding**, not live — every feature defaults to hitting the real backend;
  the per-feature `VITE_USE_*_MOCK` flags and their `src/mocks/*.mock.js` files were dev-phase
  fallbacks for backend phases that are now real.

No files were created or modified during this phase.

## Exit criteria (met)

- The current frontend architecture is fully mapped against the backend's 7-role migration.
- Every concrete gap (hardcoded role checks, missing modules, stale mocks, stale permission
  constants) is identified with file:line precision, feeding directly into Phases F01-F16 below.

Proceed to `frontend-phase-01-role-permission-sync.md`.
