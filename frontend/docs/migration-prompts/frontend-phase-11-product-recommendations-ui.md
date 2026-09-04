# Frontend Migration Phase 11 — Product Recommendations UI

**Depends on:** Backend Phase 13. Frontend Phase F01. **Type:** new feature, small.

---

## Prompt 11.1 — API layer and creation/approval UI

```
Add `PRODUCT_RECOMMENDATION` endpoints to `apiConfig.js` (check
`BACKEND/backend/src/modules/productRecommendations/productRecommendation.routes.js`).

Create `src/features/productRecommendations/services/productRecommendationApi.js`: create,
approve, archive, list (the "visible to me" read path).

Build `ProductRecommendationCreateDialog.jsx` (product picker reusing the existing Products
feature's product selector if one exists, targetRole/targetTeam/targetArea as independently
optional fields, reason required) gated `PERMISSIONS.PRODUCTS_RECOMMEND` (added in Phase F01, or
add it now if F01 deferred it — check first). Add Approve/Archive row actions on a
`ProductRecommendationManagePage.jsx` list for whoever creates/approves them.
```

**Acceptance criteria:** creating a DRAFT recommendation and approving it works; a DRAFT is not
visible anywhere in Prompt 11.2's "visible to me" view until approved.

---

## Prompt 11.2 — "Recommended for you" view

```
Build `MyProductRecommendationsPage.jsx` (or a widget/section on the existing Products list page,
your call based on what reads more naturally) calling the "visible to me" list endpoint — this
already filters server-side to APPROVED + (no target OR target matches the actor), so render
whatever comes back directly, no client-side re-filtering by role/team/area. Add it to the
Employee and Sales Manager portal navigation, gated by whatever read permission the backend uses
for this endpoint (check the routes file — likely just requires authentication, not a specific
permission, since it's inherently self-scoped).
```

**Acceptance criteria:** an FO in District X sees a recommendation targeted at "FO role, District
X" and does not see one targeted at District Y or at the SO role.

---

## Stop and report

After Prompt 11.2, create one recommendation targeted narrowly (a specific role + district) and
confirm visibility is correctly narrowed for two different test users.

## Phase F11 exit criteria

- Targeted recommendations are visible only to matching users; DRAFT recommendations are invisible
  outside their creator/approver.
