# Frontend Migration Phase 15 — Full Shell Consolidation (Optional, Deferred)

**Status: deferred. Not a blocking dependency for anything in this plan.**
**Depends on:** Phases F02-F14 all complete and stable in production use for a while.

## Why this exists as its own phase, and why it's deferred

Phase F02 deliberately chose NOT to merge the three portals (`super-admin/`, `sales-manager/`,
`employee/`) into one generic shell — it widened who's let into each existing tree instead, which
got all 7 roles working with minimal risk. That was the right call for getting the migration done
quickly and safely, but it does mean this frontend still carries three parallel route/layout/nav
trees rather than one.

Once every new feature from F03 onward has been built as genuinely role-agnostic, permission-gated
components (which they were, by this plan's own convention), a LATER cleanup could:
- Collapse `SuperAdminRoutes.jsx`/`SalesManagerRoutes.jsx`/`EmployeeRoutes.jsx` into one route
  config using `RoleAwareInternalLayout` (already built, already correct after F02) directly.
- Deduplicate any near-identical page pairs across the three trees that turned out, in practice, to
  be doing the same thing at different scopes (e.g. an employee list page that's identical between
  portals except for which rows the backend's scope engine returns).
- Retire the three separate navigation array files in favor of one master array, permission-
  filtered, with no role branching left anywhere in the routing layer at all.

**Do not start this unprompted.** It's a pure-refactor, no-new-capability phase with real regression
risk across every existing page, and this plan's whole philosophy has been "extend safely, verify
each step" — collapsing three working trees into one is exactly the kind of change that should wait
until there's real confidence nothing is actively changing underneath it, and should be explicitly
requested rather than assumed to be "next" just because it's the next file in this folder.

## If and when this is picked up

Treat it as its own from-scratch planning exercise at that time — re-audit which pages have
actually diverged in practice (some may have grown portal-specific quirks over the many phases in
between) rather than assuming F02's original snapshot still holds.
