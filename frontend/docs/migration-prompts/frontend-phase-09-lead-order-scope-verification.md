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
