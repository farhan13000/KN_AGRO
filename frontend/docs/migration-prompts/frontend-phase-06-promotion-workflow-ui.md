# Frontend Migration Phase 6 — Promotion Workflow UI

**Depends on:** Backend Phase 7 (done, verified). Frontend Phases F01, F04. **Type:** new feature,
replaces an existing hardcoded action.

**What this replaces:** `features/employees/components/EmployeeLifecycleDialog.jsx`'s current
"promote" action, which promotes to a single hardcoded role via `core/config/env.js`'s
`salesManagerRoleId` env var. That whole mechanism assumed the old flat model (only one possible
promotion target existed). The backend's real Promotion module (recommend -> approve/reject ->
completes via `changeEmployeeRole`) replaces it entirely — do not keep both paths alive.

---

## Prompt 6.1 — Promotion API layer

```
Add `PROMOTION` endpoints to `apiConfig.js`: `POST /promotions`, `GET /promotions`,
`GET /promotions/:id`, `POST /promotions/:id/approve`, `POST /promotions/:id/reject`,
`POST /promotions/:id/cancel` (confirmed exact paths from
`BACKEND/backend/src/modules/promotions/promotion.routes.js`).

Create `src/features/promotions/services/promotionApi.js` with matching functions:
`recommendPromotion(employeeId, proposedRoleId, reason)`, `listPromotions(query)`,
`getPromotion(id)`, `approvePromotion(id, comment)`, `rejectPromotion(id, comment)`,
`cancelPromotion(id)`. No mock.
```

**Acceptance criteria:** each function correctly calls its endpoint and returns the response body's
`data.promotion`/`data.promotions`+`data.pagination` shape (confirmed from the backend's
`ApiResponse` wrapper).

---

## Prompt 6.2 — Retire the hardcoded promote action; add "Recommend for Promotion"

```
Remove the old promote-to-sales_manager action from `EmployeeLifecycleDialog.jsx` and the
now-unused `salesManagerRoleId` from `core/config/env.js` (grep first to confirm nothing else reads
it before deleting).

Add a "Recommend for Promotion" button on the employee detail page, gated by
`PERMISSIONS.PROMOTION_RECOMMEND` — note this is a NECESSARY-but-not-sufficient gate (the backend
additionally checks role-tier AND `canManageEmployee`; a user can hold `PROMOTION_RECOMMEND`
company-wide but still get a 403 for a specific employee outside their chain — render that 403's
message inline in the dialog, don't treat it as an unexpected error).

Build `PromotionRecommendDialog.jsx`: employee is pre-filled (already on this page), proposed role
is a plain Role picker (do NOT hardcode "the next tier up" logic on the frontend — the backend's
approver matrix is the only place that rule lives; if an invalid pair is picked, the backend's 400
with its specific message ("No configured promotion path from X to Y") is what the user sees),
reason field (required, per the model). On submit, call `recommendPromotion`.
```

**Acceptance criteria:** the old hardcoded promote action no longer exists anywhere; recommending a
valid promotion succeeds and creates a RECOMMENDED promotion; recommending an invalid tier-skip or
an employee outside the actor's chain surfaces the backend's specific error message.

---

## Prompt 6.3 — Pending approvals, my recommendations, and promotion history

```
Add three views, all list-shaped and reusing one `PromotionListItem`/`PromotionCard` component with
different action sets per context:

1. `PendingPromotionApprovalsPage.jsx` — `listPromotions({status: "RECOMMENDED"})`, filtered to ones
   the current actor can act on (the backend's list endpoint doesn't pre-filter by
   "can I approve this" — confirm this by checking `promotion.service.js#list`; if it returns
   everything regardless of actor, filter client-side is NOT reliable for permissions, only for
   display — the real gate is still the backend's per-action 403 on Approve/Reject clicks, so don't
   hide a promotion from this list just because you're unsure the actor can act on it; let them try
   and show the 403 inline if they can't). Approve/Reject buttons open a small comment-required
   dialog. Gate the page itself behind `PERMISSIONS.PROMOTION_APPROVE` OR `PROMOTION_REJECT` (either
   is enough to warrant seeing the page — the per-row action button is what's actually gated
   precisely).
2. `MyPromotionRecommendationsPage.jsx` — `listPromotions({recommendedBy: currentUserId})` (check if
   the backend's list endpoint actually supports filtering by `recommendedBy` — if not, that's a
   gap to report, not to work around by fetching everything and filtering client-side, which would
   leak other users' recommendations to the browser). Cancel button for still-RECOMMENDED entries.
3. `PromotionHistorySection.jsx` on the employee detail page — `listPromotions({employee: id})`,
   read-only, showing status/dates/comments for every promotion (any status) tied to this employee.

Add nav items for 1 and 2 to `superAdminNavigation.js` and `salesManagerNavigation.js`
(permission-gated as above).
```

**Acceptance criteria:** all three views render correctly; a reject requires a comment (matching
the backend's validation); cancelling a promotion you didn't recommend is not offered as a button
(and would 403 if attempted directly).

---

## Stop and report

After Prompt 6.3, report whether the backend's `GET /promotions` endpoint actually supports
`recommendedBy`/actor-scoped filtering as query params — if it doesn't, flag it as a backend gap
(Prompt 6.3's "My Recommendations" view is client-side-filtered as a stopgap and should be revisited
once the backend adds that filter, since client-side filtering after fetching "all" would leak data
if this page's underlying fetch isn't already scoped correctly by the backend for this actor).

## Phase F06 exit criteria

- The old hardcoded single-role promote action is fully removed.
- Recommend/approve/reject/cancel are all operable through the UI, showing the backend's specific
  error messages rather than swallowing them.

---

## IMPLEMENTED AND VERIFIED

### A backend endpoint had to be added first

The role picker this phase depends on was **impossible to build**: the backend had no roles API at
all (`src/modules/roles/` held only `role.model.js` + `role.service.js`, with no controller, no
routes, and nothing mounted in `routes/index.js`). Role ids aren't obtainable anywhere else either —
`employee.serializer.js` returns `role: {name, permissions}` with **no `_id`**. That is exactly why
the code being replaced used a hardcoded `VITE_SALES_MANAGER_ROLE_ID`; the original author left the
reason in a comment: *"no roles listing endpoint is exposed."*

Added (approved before touching the backend): `role.controller.js`, `role.routes.js`, and a two-line
mount. `GET /api/v1/roles` returns **`{_id, name, description}` only** — deliberately omitting the
`permissions` array, since nothing that *picks* a role needs the authorization model. Gated by
`authenticate` alone rather than a new permission: every actor who can start a promotion or hiring
flow needs it, role *names* are already visible on every employee record, and a `ROLES_READ`
permission would have meant editing `seedRoles.js` to grant it to nearly every role anyway. Verified
live: 401 unauthenticated, correct narrowed payload when authenticated.

**This also unblocks F07** — `hiring.validation.js` requires a `proposedRoleId` from the client too.

### Backend gap found — "My Recommendations" was deliberately NOT built

`promotionListQuerySchema` accepts only `page`, `limit`, `status`, `employee` — **no
`recommendedBy`** — and `PromotionService.list()` isn't actor-scoped, so it returns every promotion
matching the filter regardless of who is asking. Building the page anyway would have meant fetching
all promotions and filtering in the browser, putting other users' recommendations on the client.
Per this prompt's own instruction, that is reported rather than worked around. **Two things for the
backend: add a `recommendedBy` filter, and consider whether `GET /promotions` should be actor-scoped
at all.**

### What was built

`features/promotions/` — `promotionApi.js`, `usePromotionQueries.js` (incl. `useRoleOptions`), and
components: `PromotionRecommendDialog`, `PromotionDecisionDialog`, `PromotionCard`,
`PromotionStatusBadge`, `PromotionHistorySection`, `PendingApprovalsView`. Approvals pages wired
into both portals with nav entries; `PromotionHistorySection` added to the employee detail page.

The role picker offers **all** roles rather than computing "the next tier up" — the approver matrix
lives only in the backend, and an invalid pair returns its own message. The approvals queue
deliberately does **not** hide rows the actor might not be able to decide: the list endpoint isn't
actor-scoped, so guessing would only hide legitimate work; the real gate is the per-action 403,
shown inline.

**Old path fully removed:** the `promote` lifecycle action, its `actionConfig` entry, its mutation
branch, `EMPLOYEE_LIFECYCLE_ACTIONS.PROMOTE`, its `canShowEmployeeLifecycleAction` branch, the
`salesManagerRoleId` prop, `env.salesManagerRoleId`, the `VITE_SALES_MANAGER_ROLE_ID` entry in
`.env.example`, and the now-callerless `employeeApi.promoteToManager` + its mutation.

### Bugs I introduced and caught

Two dangling-reference bugs, both of which **`npm run build` passed straight through** and only a
real browser caught (the same failure mode as Phase F02's orphaned mock helpers):

1. `TrendingUp` used in both navigation files but never imported — a guard in my own edit script
   skipped the import because the icon name was already present in the line it had just inserted.
   Every nav file's icons are now checked.
2. `isPromotionBlocked` still referenced in a `disabled` prop after its declaration was deleted.

Both crashed the whole page via React Router's error boundary. Afterwards I grepped every identifier
removed this phase to confirm nothing else dangles.

### Verification

Real browser (Playwright/Chromium) against the live dev backend, on a purpose-built
`GM → RM → ASM → SO → FO` chain. **13/13 checks passed, zero page errors:** old action gone, new
action present, history empty for a fresh employee, role picker populated from the new endpoint,
**tier-skip rejected with the backend's own wording** (*"No configured promotion path from fo to
rm"*), valid FO→SO recommendation succeeds, history shows it awaiting approval, it appears in the
approvals queue, **reject without a comment is blocked**, approve completes it, and history shows
Completed. Confirmed directly in the database afterwards: the FO's role really is `so`, with exactly
one promotion record in `COMPLETED`. All test data removed.
