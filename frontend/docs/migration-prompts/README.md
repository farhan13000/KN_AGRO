# Frontend Migration Prompts — SA/OA/GM/RM/ASM/SO/FO Organizational Migration

This folder holds ready-to-run prompts for a coding agent (e.g. Claude Code) to migrate this
frontend (`kn-agro-public-frontend`, React 18 + Vite + Tailwind + react-router-dom v6 + axios) onto
the same 7-role sales hierarchy (SA, OA, GM, RM, ASM, SO, FO) already implemented and verified on
the backend (see `../../BACKEND/backend/docs/migration-prompts/`, phases 0-7 done, 8+ in progress).

**Companion document:** the reconnaissance report and the "how to proceed" plan behind these phases
was produced in conversation, not as a separate file — the short version: don't build 5 more
parallel role-folders on top of the existing `super-admin/`, `sales-manager/`, `employee/` trees.
Reuse them by widening who's *allowed into* each tree (Phase F02), and build every genuinely new
feature (region, district, promotion, transfer, hiring, salary proposal, DSR) as a role-agnostic
module from day one, gated by permission strings, never by role name.

## Current status (as of the start of this plan)

- Backend phases 1-7 are implemented and verified (Roles/Permissions, Region, District, Employee
  Hierarchy Fields, Organizational Scope Engine, Employee Transfer History, Promotion Workflow).
  Backend phases 8-16 (Hiring, Salary Proposal, Lead Scope, Order Attribution, Attendance/Leave/
  Reports/DSR, Product Recommendations, Analytics, Communication, Audit Coverage) are designed
  (their own migration-prompt files exist) but not yet built.
- This frontend currently implements only the OLD 3-role model (SUPER_ADMIN, SALES_MANAGER,
  EMPLOYEE) and has ZERO footprint for region, district, promotion (beyond one hardcoded
  single-role "promote" action), transfer, hiring-as-a-workflow, salary proposal, or DSR.
- The app runs against the real backend by default everywhere except one legacy self-registration
  path; dev-phase mock files exist per feature but are all off by default and are now stale
  scaffolding (all backend phases they were mocking are real).

## Dependency on the backend

Every frontend phase below states which BACKEND phase it depends on. **Do not start a frontend
phase whose backend dependency hasn't been implemented and verified yet** — several frontend
phases (F07 Hiring, F08 Salary Proposal, F10 DSR, F11 Product Recommendations) depend on backend
phases (8, 9, 12, 13) that are not yet built as of this plan's writing. Work through the frontend
phases that ARE unblocked (F00-F06, F09's verification half) while the backend continues in
parallel, then pick up the rest as their backend dependency lands.

## How to use these files

1. Work through phases **in order** — `frontend-phase-00-*.md`, then `-01-`, etc. — except where a
   phase is explicitly blocked on a backend phase not yet done; skip ahead to the next unblocked
   phase in that case and come back later, don't force an out-of-order frontend phase whose data
   shape doesn't exist yet.
2. Each phase file contains **multiple numbered prompts**. Feed them to the coding agent **one at a
   time**, in order, within that phase. Each prompt restates the context it needs.
3. After the **last** prompt in a phase, stop and report. Confirm the phase's exit criteria (stated
   at the bottom of the file), start the dev server and click through the actual change in a
   browser as at least one of the roles affected, and only then move to the next phase's file.
4. If a prompt's acceptance criteria fail, fix forward within that same prompt's scope before
   moving on.

## Conventions every prompt assumes (don't repeat these in each prompt)

- **Stack:** React 18, Vite, Tailwind, react-router-dom v6, axios, no TypeScript.
- **Feature module shape:** `src/features/<name>/` with `services/<name>Api.js`, `components/`,
  `hooks/`, `constants/` — follow the existing `src/features/quotations/` module as the cleanest
  reference (fully permission-driven, no role coupling, no mock).
- **API layer:** one central axios instance, `src/core/api/apiClient.js` (`apiClient`), with
  endpoints declared in `src/core/api/apiConfig.js` (`API_ENDPOINTS`). New endpoints go there, not
  inlined as string literals in a feature's API file.
- **Auth/permissions:** role is `user.role.name`; permissions are `user.role.permissions[]` read via
  `useAuth()`'s `hasPermission(permission)` (`src/core/auth/AuthContext.jsx`) or the `<PermissionGuard
  permission="...">` component/`withPermission()` route helper. **Never branch UI on `role === "x"`
  for an access-control decision** — that duplicates a rule the backend already enforces and WILL
  drift. Role may only be read for cosmetic/display purposes (which portal to land on, a label in
  the profile menu) — see Phase F02 for the one existing violation of this being fixed.
  A role/permission constant is only ever a fact about identity or a UI label, never a source of
  business logic ("who can manage whom", "who can approve what") — that lives on the backend; if a
  screen needs that answer, call the endpoint and render its response/error, don't recompute it.
- **Mutations:** every feature's `hooks/use<Name>Actions.js` (or similar) wraps an API call with
  loading/error state and calls `onSuccess` — follow whatever hook pattern the feature you're
  extending already uses; don't invent a new state-management approach for one new button.
- **Errors:** a 403 from a permission or scope check must render as a clear inline message from the
  backend's own error body (`err.response?.data?.message`), never a generic "something went wrong" —
  several backend phases deliberately return specific messages (e.g. "Only a RM may approve this
  promotion") that are wasted if swallowed.
- **No comments unless they explain a genuinely non-obvious WHY.**
- **Tests:** this frontend doesn't have a component-test framework wired up (check
  `package.json` — only `phaseN-unit-checks.mjs`/`phaseN-static-audit.mjs` style scripts exist per
  older phases). New phases should add an equivalent lightweight static-audit script only if it
  clearly earns its keep (e.g. "grep the tree for any remaining hardcoded role-name check"); manual
  verification (start `npm run dev`, log in as each affected role, click through) is the primary
  verification method for this repo — treat that as the actual bar, not optional polish.

## Working agreement for the agent

- Do not run `git push`, force operations, or delete branches unless explicitly asked.
- Create commits only when explicitly asked.
- Do not modify any file outside the phase's stated scope. If you find something broken or
  inconsistent outside that scope, report it — don't fix it inline.
- Do not begin the next phase's prompts, even if this phase's work completes early. Stop and report.
- If a prompt's instructions conflict with what you find in the actual code, stop and report the
  conflict rather than guessing.
