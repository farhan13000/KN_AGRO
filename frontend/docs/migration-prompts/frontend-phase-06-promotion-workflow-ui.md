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
