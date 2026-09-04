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

---

## IMPLEMENTED AND VERIFIED

**Real design finding, disclosed before building anything:** `GET /product-recommendations` is a
**single** endpoint — the backend's own `listVisibleTo` already returns a different shape depending
on who's asking (approval authority sees everything including every DRAFT; everyone else sees only
APPROVED + targeted-at-them + their own drafts). There is no separate "manage" endpoint versus
"visible to me" endpoint. Rather than building two structurally different data-fetching paths for
what's actually one query, built **one shared `ProductRecommendationListView`** that renders whatever
the single endpoint returns and only decides which *actions* to offer (Create if `PRODUCTS_RECOMMEND`,
Approve if `PRODUCTS_MANAGE`, Archive if creator-or-`PRODUCTS_MANAGE`) — matching the doc's own two
prompts (11.1 "Manage" page, 11.2 "visible to me" page) as two thin page wrappers around the same view
with different copy, not two divergent implementations.

**Built:** `PRODUCTS_RECOMMEND` permission constant added (confirmed deferred by Phase F01, matching
the doc's own anticipation). `src/features/productRecommendations/` —
`productRecommendationApi.js` (create/list/approve/archive, matching
`productRecommendation.routes.js` exactly); `ProductRecommendationStatusBadge`, `-Card`,
`-CreateDialog` (product picker via the existing `useProductList`, matching Prompt 11.1's own
instruction to reuse it; targetRole/targetTeam/targetArea genuinely independent optional fields,
reason required, matching the model directly), `-ListView`. `targetTeam` ("the manager whose team is
targeted") is narrowed to `MANAGER_TIER_ROLES` in the picker, same reasoning the Lead assignment
dialog (Phase F09) already established for the same concept.

**Permission distribution confirmed against `seedRoles.js` before wiring anything:**
`PRODUCTS_RECOMMEND` → GM/RM/ASM only (SO/FO are the audience, not creators). `PRODUCTS_MANAGE`
(reused for approval, no new permission invented) → nobody outside the SA wildcard. Pages wired
into all three portals accordingly — Super Admin and Sales Manager get the create button (where the
actor's permission allows it); Employee gets read-only "recommended for you," with no
`showCreateButton` prop hardcoding that assumption (an earlier draft had one — removed once I
noticed it duplicated what the real `hasPermission` check already decides correctly on its own,
matching this codebase's own "never branch on role for access control" rule).

**Verification:** real browser (Playwright/Chromium) against the live dev backend and the real
Phase 17 seeded org — **10/10 checks passed**, exactly matching the Stop-and-report's own ask (one
narrowly-targeted recommendation, checked against two — actually four — different real users):

- An RM (holds `PRODUCTS_RECOMMEND`) creates a DRAFT recommendation targeted at **FO role + North
  Central district** specifically.
- The DRAFT is invisible to its actual target FO before approval — the Prompt 11.1 acceptance
  criteria, confirmed live.
- SA (holds `PRODUCTS_MANAGE`) sees the DRAFT (approval authority sees everything) and approves it.
- **The FO in North Central (role AND district both match) now sees it.**
- **A different FO in North East (role matches, district doesn't) does NOT see it.**
- **An SO in the SAME North Central district (district matches, role doesn't) does NOT see it** —
  confirming the backend's AND-across-set-dimensions rule, not just an OR.
- The SO also correctly has no Create button (lacks `PRODUCTS_RECOMMEND`).
- Zero uncaught page errors.

**Cleanup confirmed:** the test recommendation was archived and then deleted; no leftover data.
`npm run build` — clean, no errors.
