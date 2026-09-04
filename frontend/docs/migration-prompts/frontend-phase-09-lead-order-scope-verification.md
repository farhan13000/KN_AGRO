# Frontend Migration Phase 9 — Lead & Order Scope Verification + Attribution UI

**Depends on:** Backend Phases 10, 11. Frontend Phase F02. **Type:** mostly VERIFICATION, plus one
new small dashboard addition. **Read this phase's framing carefully — it is unlike every other
phase in this plan.**

**Why this phase is different:** Lead and Order scoping is enforced entirely server-side by the
backend's Scope Engine (Phases 5, 10, 11) — an RM calling the exact same `GET /leads` endpoint a
Sales Manager always called gets back their correct full downline automatically, with zero frontend
code change required for the ACCESS part. This phase is NOT about rebuilding lead/order list pages.
It is about (1) confirming nothing in the existing Lead/Order UI silently re-narrows what the
backend already returns, and (2) surfacing the new fields/rollups the backend added.

---

## Prompt 9.1 — Confirm no client-side re-narrowing of scope

```
Grep `src/features/leads/` and any order-related feature module for any client-side filtering of a
list response by `assignedManager`/`assignedEmployee` matching the CURRENT logged-in user's id (as
opposed to just rendering whatever the backend already returned). If you find any such filter, it
is now WRONG — it would silently hide an RM's full downline behind an accidental "only records
literally assigned to me" filter that made sense under the old flat model but not the new N-tier
one. Remove any such filter; the backend's response is already correctly scoped, and the frontend's
job is to render it, not narrow it further.

Also confirm the "my team"/"all" toggle (if one exists in the current Lead list UI) still makes
sense: "my team" should mean "call the endpoint with whatever scope param already means
`OWN_TEAM`", not a frontend-side recomputation of who's on the team.
```

**Acceptance criteria:** a documented, explicit confirmation (list of files checked, what was found)
that no frontend code re-narrows an already-correctly-scoped backend response — this is a report-
back item even if literally nothing needed changing.

---

## Prompt 9.2 — Surface region/district on Lead and Order

```
The backend's Phase 10/11 add `region`/`district` (captured at creation, not recomputed) to Lead
and Order. Confirm they're present in the API response (check the relevant serializer), then add
them as a visible column/field on the Lead list/detail and Order list/detail views, alongside the
existing `assignedManager`/`assignedEmployee` display — do not replace those, they remain correct
per the backend's own decision to leave them untouched.
```

**Acceptance criteria:** region/district are visible on Lead and Order screens; an employee's later
transfer (Phase F05) does NOT retroactively change the region/district shown on their pre-transfer
Leads/Orders (verify this directly — transfer someone, then re-check an old Lead of theirs).

---

## Prompt 9.3 — Sales attribution rollup widgets

```
The backend's Phase 11 adds a sales-attribution rollup endpoint (`GET /orders/attribution` or
similar — check `order.routes.js`/`orderAttribution.service.js` for the actual path), returning the
FO/SO-direct/SO-team/ASM-area/RM-regional/GM-company buckets scoped to the calling actor.

Add a small dashboard widget (a handful of stat cards, not a new page) to the Sales Manager
portal's dashboard showing whichever bucket matches the current actor's tier (an RM sees their
regional total, a GM sees company-wide, etc. — the backend's own scoping already picks the right
bucket for whoever calls it, so this widget just renders whatever comes back, no role-branching
needed on the frontend side beyond which endpoint response shape to expect).
```

**Acceptance criteria:** the widget renders the correct rollup number for at least an RM and a GM
test user, and transferring an employee doesn't change a historical order's contribution to either
number (same "snapshot, don't recompute" check as Prompt 9.2, one level up).

---

## Stop and report

After Prompt 9.3, report Prompt 9.1's findings explicitly (what was checked, what if anything was
found and fixed) — this is the prompt most likely to be skipped as "probably fine," and it's the
one most load-bearing for correctness.

## Phase F09 exit criteria

- No frontend code re-narrows an already-correctly-scoped backend response.
- Region/district are visible and correctly frozen-at-creation-time on Lead/Order.
- The sales attribution rollup widget renders correctly per tier.

---

## IMPLEMENTED AND VERIFIED

### Prompt 9.1 — findings (the load-bearing prompt, reported in full as asked)

**Files checked:** every file under `src/features/leads/` and `src/features/orders/`, grepped for
`assignedManager`/`assignedEmployee`/role-name literals/`.filter(` calls that could re-narrow a list
response by the current user's id.

**No list-response re-narrowing found** — `LeadTable.jsx`, `OrderTable.jsx`, and every list/pipeline
view render exactly what the backend returns; every `.filter(` call found is either query-cleanup
(stripping empty params) or display formatting, never a "does this belong to me" check against a
list response. Orders came back completely clean — zero role-name literals anywhere in
`src/features/orders/`.

**Two real, disclosed bugs found and fixed in `src/features/leads/` — not list-narrowing exactly, but
the same failure mode Prompt 9.1 describes: a hardcoded old-role assumption silently breaking the new
hierarchy:**

1. **`leadCapabilities.js` — `canAssignManager`/`canAssignEmployee` were hardcoded to
   `role === SUPER_ADMIN` / `role in [SUPER_ADMIN, SALES_MANAGER]`.** This hid the Assign Manager/
   Employee buttons from every new-hierarchy role — including the new `SA` account itself — even
   though `LEADS_ASSIGN` (the actual backend permission both routes are gated on, with no further
   role split) is genuinely held by GM/RM/ASM/SA. This is exactly the "duplicates a rule the backend
   already enforces and WILL drift" pattern this codebase's own conventions warn against — and had
   already drifted. Fixed by dropping the role check entirely; both capabilities are now
   permission-only, matching every other capability in this file.
2. **`LeadCommandDialogs.jsx`'s `AssignmentDialog` — the candidate-employee queries were gated to
   `role === SALES_MANAGER` (team query) / `role === SUPER_ADMIN` (all-employees fallback), and the
   manager-picker filtered candidates to `role === SALES_MANAGER` only.** Net effect: a GM/RM/ASM
   assigning an employee to a lead got an empty candidate dropdown (neither query was ever enabled
   for them), and no GM/RM/ASM/SO could ever appear as a candidate in the manager picker at all.
   Fixed using `MANAGER_TIER_ROLES` (`roles.constants.js` — already defined specifically for
   populating candidate-manager pickers like this one, but never actually wired in here).

Both bugs were live and reproducible before the fix — confirmed by removing the fix locally and
re-running the same check, which returned to a 1-option (placeholder-only) candidate list.

### Prompt 9.2 — region/district surfaced

Confirmed present in both backend serializers before touching anything (`lead.serializer.js`,
`order.serializer.js` — both call `toGeoSummary`, `{_id, name, code}` or `null`). Added as visible
fields:

- `LeadTable.jsx` — two new columns (Region/District), gated by a new `showLocation` prop that
  defaults to mirroring `showAssignments` (same "who/where this belongs to" grouping — any view that
  already hides assignments hides location too, unless overridden).
- `LeadSummaries.jsx`'s `LeadAssignmentSummary` — two more entries in the existing Assignment card.
- `OrderTable.jsx` — two new columns (Order had no existing Manager/Employee columns to sit
  "alongside," so these are the first attribution-adjacent columns on this table).
- `OrderDetailView.jsx` — a new "Location" card, added as a third card in what was a 2-card grid
  (Customer, Source Quotation), rather than folded into an unrelated existing card.

### Prompt 9.3 — sales attribution widget

`GET /orders/attribution` confirmed via `order.routes.js`/`order.controller.js`/
`order.service.js#getAttributionRollup` — returns `{scope, totalSales, orderCount, breakdown: [{role,
totalSales, orderCount}]}`, already scoped server-side per caller. Added `OrderAttributionWidget.jsx`
(two stat cards + a per-role breakdown list) to `SalesManagerDashboardPage.jsx` — currently a trivial
`DashboardShell` placeholder shell shared by all three portals (per Phase F02's own note, real
dashboards land in Phase F12) — rendered as a sibling, not folded into the shared shell, so
super-admin/employee stay untouched. Gated by a new `ORDERS_ANALYTICS_READ` permission constant
(confirmed against `seedRoles.js`: held by legacy SALES_MANAGER, GM, RM, ASM — not SO/FO, matching
the acceptance criteria's own "at least an RM and a GM" bar).

**Corrected assumption, disclosed:** initially assumed a GM would see `scope: "ALL"` ("company-wide").
Direct API confirmation showed GM actually gets `scope: "OWN_TEAM"`, same as RM — only SA/OA resolve
to `GLOBAL`/`ALL` in this backend's scope engine (Phase 5's own documented design: "GM-A cannot
resolve into GM-B's entire branch"). The widget's scope-label map (`ALL: "Company-wide", OWN_TEAM:
"Your downline"`) was already correct as built; it was my own test assumption that was wrong, caught
by checking the live API before asserting on it rather than guessing.

### Verification

Real browser (Playwright/Chromium) against the live dev backend and the real Phase 17 seeded org (an
RM, their ASM report, the RM's own GM, real SA/OA) — **14/14 checks passed** after fixing several
test-script timing bugs surfaced along the way (a full-page navigation re-triggers the app's own
session check, which needed waiting out; a CSS `uppercase` class meant `innerText()` returned
`"TOTAL SALES"` not `"Total Sales"`; the real "Employee" button label isn't "Assign Employee"):

- Backend Lead/Order responses confirmed to include region/district.
- Lead/Order list and detail views all show Region/District with real values.
- The Assign Employee dialog's candidate list is non-empty for an RM — the actual, reproduced fix for
  Prompt 9.1's bug.
- RM's dashboard widget shows a real total (₹1,809.98 / 2 orders), correctly scoped "Your downline."
- GM's dashboard widget shows the same real total for their downline, correctly scoped "Your
  downline" (not "Company-wide" — the corrected assumption above).
- **The frozen-at-creation acceptance criteria, the actual point of Prompt 9.2** — the RM was
  transferred to a different district via a real Transfer (Phase F05), and the Lead/Order created
  *before* that transfer were re-checked afterward: both still show the original district, untouched.
- Zero uncaught page errors across the whole run.

**Cleanup confirmed:** all test-created Lead/Quotation/Order documents removed; the RM's district
transfer was reverted, restoring the Phase 17 seeded org to its exact original shape. `npm run build`
— clean, no errors.
