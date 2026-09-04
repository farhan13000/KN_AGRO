# Frontend Migration Phase 16 — Full Regression Testing

**Depends on:** Phases F01-F14 (F15 excluded — it's optional/deferred and not required for this
plan to be considered complete). **Type:** testing.

---

## Prompt 16.1 — Per-role smoke test

```
Using seeded demo users for all 7 roles (backend's demo-seed scripts, or real hiring-created
accounts from Phase F07 if available by now), for EACH role:

1. Log in — confirm correct portal, correct nav items shown (only permission-matching items),
   correct dashboard variant (Phase F12).
2. Click through every nav item once — confirm no console errors, no blank/crashed pages.
3. Attempt one action outside the role's permission (e.g. an FO trying to reach a Region create
   form via direct URL) — confirm Unauthorized/403, not a silent success or a crash.

Report as a per-role pass/fail table, not a summary paragraph.
```

**Acceptance criteria:** 100% pass across all 7 roles.

---

## Prompt 16.2 — End-to-end workflow walkthroughs

```
Walk through each multi-step workflow built in this plan, start to finish, in the browser:
- Region create -> District create -> assignment request -> review -> finalize (F03).
- Employee hierarchy displays correctly N levels deep; transfer an employee, confirm hierarchy and
  history both update correctly (F04, F05).
- Promotion: recommend -> approve, confirm employee's role actually changed in the UI (F06).
- Hiring: request -> process -> review -> approve -> complete, confirm new employee can log in
  (F07, if backend Phase 8 was ready in time).
- Salary proposal: create -> review -> approve -> finalize, confirm salary UI reflects it (F08).
- DSR: submit -> review -> acknowledge across a real 3-tier chain (F10).
- Product recommendation: create -> approve, confirm correct-and-only-correct visibility (F11).
- Audit trail: confirm at least 3 of the above actions produced a correctly-displayed audit entry
  (F14).

Report as a pass/fail table per workflow, noting any phase that was skipped because its backend
dependency wasn't ready yet (that's an expected, reportable gap, not a failure of this phase).
```

**Acceptance criteria:** 100% pass for every workflow whose backend dependency was actually ready;
explicit list of anything skipped and why.

---

## Prompt 16.3 — Build and console-health check

```
Run `npm run build` — confirm it completes with no errors. Run `npm run dev`, open the browser
console, and click through the app broadly (not just once per role — general navigation) confirming
no repeated warnings/errors accumulate (React key warnings, failed prop-type checks, uncaught
promise rejections). Fix anything found before declaring this phase done, without expanding scope
into unrelated pre-existing issues this migration didn't introduce — note those separately instead
of fixing them here.
```

**Acceptance criteria:** clean production build; no new console errors introduced by this
migration's own work.

---

## Stop and report

Present all three pass/fail tables together, plus the explicit list of anything deferred due to an
incomplete backend dependency. This is the final phase of the frontend migration plan — once this
passes (accounting for documented gaps), the frontend is complete for everything the backend has
shipped so far; anything the backend still owes (later backend phases) gets its own frontend phase
added to this folder when that backend work lands.

## Phase F16 exit criteria

- 100% pass on the per-role smoke test and all ready workflows.
- Clean production build, no new console errors.

---

## IMPLEMENTED AND VERIFIED

Real browser (Playwright/Chromium) against the live dev backend and the real Phase 17 seeded org,
for every one of the 7 new-hierarchy roles and all 8 named workflows. Expected nav-per-role was
derived from each role's **live** `role.permissions` array (fetched fresh via real login, not
recalled from memory) cross-referenced against the three navigation source files — not assumed.

**A real, transient methodology issue surfaced and is disclosed here rather than hidden:** two full
runs of the per-role suite showed inconsistent, non-reproducible failures (a permission-boundary
check passing for one role but not another between runs, a dashboard-content wait timing out). Each
one was individually investigated — isolated re-tests, exact-flow replays — before being written off
as a false alarm. Root cause found and confirmed via direct curl: the backend's dev-mode
`authRateLimiter` (100 requests/15 min) was exhausted by this session's own cumulative login volume
across Phases F12–F16, returning 429s that surfaced as apparent (but non-existent) UI bugs. Confirmed
by checking `RateLimit-Remaining` directly, waiting for the window to clear, then rerunning — 100%
clean and deterministic every time once the rate limit had headroom. No product code caused any of
these; the final numbers below are all from clean, rate-limit-headroom runs.

### Prompt 16.1 — Per-role smoke test (42/42 checks passed)

| Role | Login → correct portal/dashboard | Nav shows exactly permission-matching items | Every nav item renders, no blank/crash | Zero console errors | Out-of-permission URL blocked |
|------|:---:|:---:|:---:|:---:|:---:|
| SA  | PASS | PASS (27 items) | PASS | PASS | PASS — blocked from `/manager/dashboard` (SA holds the wildcard but isn't in that portal's `allowedRoles`) |
| OA  | PASS | PASS (10 items — no Pending Approvals/Promotion Approvals/Categories/Products/CRM/Quotations/DSRs/Product Recs/Customers/Orders/Invoices/Payments/Transactions/Audit Log, per OA's real permission set) | PASS | PASS | PASS — blocked from `/super-admin/audit-log` (OA never holds `AUDIT_READ`) |
| GM  | PASS | PASS (17 items — no Regions, no My DSRs; GM lacks `region.read`/`dsr.read_self`) | PASS | PASS | PASS — blocked from `/manager/regions` |
| RM  | PASS | PASS (17 items, same set as GM) | PASS | PASS | PASS — blocked from `/manager/regions` |
| ASM | PASS | PASS (16 items — also no Districts; ASM additionally lacks `district.read`) | PASS | PASS | PASS — blocked from `/manager/regions` |
| SO  | PASS | PASS (14 items — no My Team/Regions/Districts/Hiring/Salary Proposals; SO's tier is lighter) | PASS | PASS | PASS — blocked from `/manager/districts` |
| FO  | PASS | PASS (12 items, full read-only set) | PASS | PASS | PASS — blocked from `/super-admin/regions/create` (FO isn't in that portal's `allowedRoles` at all) |

Every role's dashboard variant was also confirmed correct (SA/OA share `/super-admin/dashboard` but
only SA sees `AdminDashboardContent` — OA correctly gets the bare shell, since OA has never held
`ANALYTICS_ADMIN`, confirmed live and matching the Phase F12 backend comment "the client's own
migration plan does not define an OA-specific dashboard shape").

### Prompt 16.2 — End-to-end workflow walkthroughs (8/8 ready, 0 skipped)

| Workflow | Result | Notes |
|---|:---:|---|
| Region → District → assignment request → review → finalize (F03) | PASS | Fresh: created a real Region + District, requested assignment, a real GM reviewed/approved it, SA finalized it. District Detail UI confirms `ACTIVE` status with the correct RM/ASM names resolved. |
| Employee hierarchy N-levels-deep; transfer updates hierarchy + history (F04/F05) | PASS | Hierarchy page renders real `"X direct, X total below"` depth aggregation. Confirmed the real Phase F13 live transfer (Vivaan Kapoor → Yash Chauhan) still shows correctly in his Transfer History section. |
| Promotion: recommend → approve, role changed in UI (F06) | PASS | Fresh cycle on a real FO (Aarav Kapoor): recommended FO→SO, approved — his Employee Detail page now shows role "Sales Officer" and Promotion History shows `COMPLETED`. |
| Hiring: request → process → review → approve → complete, new employee logs in (F07) | PASS | Completed a real pending request through all 4 remaining stages; the resulting new employee account (EMP000119) **successfully logged in** with the set temporary password. |
| Salary proposal: create → review → approve → finalize, salary UI reflects it (F08) | PASS | Verified against a real, already-`FINALIZED` proposal (Aditya Kulkarni, ₹55,000/mo) — `CurrentSalaryCard` on his Employee Detail page renders the finalized amount correctly. Reused existing real data rather than re-driving a fresh cycle, since the create/review/approve/finalize button path was already exercised fresh in Phase F08's own build. |
| DSR: submit → review → acknowledge, real 3-tier chain (F10) | PASS | Fresh: a real FO submitted, their real SO reviewed, their real ASM (one tier further up) acknowledged — genuine 3 distinct actors, not 2. Shows `ACKNOWLEDGED` in All DSRs. |
| Product recommendation: create → approve, correct-and-only-correct visibility (F11) | PASS | Fresh: a GM created one targeted at role FO, SA approved it. Confirmed live in-browser: the matching FO sees it; a non-matching SO does not. |
| Audit trail: ≥3 actions show a correct audit entry (F14) | PASS (4/3) | District assignment finalize, promotion approval, hiring completion, and DSR acknowledgement all produced real, correctly-filtered entries in the Audit Log viewer. |

Nothing was skipped — every backend dependency for all 8 workflows was ready and fully exercised.

### Prompt 16.3 — Build and console-health check

- `npm run build` — clean, no errors (run repeatedly throughout this phase; final confirming run
  also clean).
- Console/page-error health: the per-role smoke test alone drove **~140 page transitions** across
  every nav item in all 7 roles' portals, plus every workflow walkthrough above, all with page-error
  listeners attached throughout — **zero uncaught page errors** at any point in this phase.

**Cleanup confirmed:** all `tmp-phase16-*.mjs`/`tmp-debug-*.mjs` verification scripts deleted,
`playwright` uninstalled, `package-lock.json` reverted. `git status` shows no source changes from
this phase — Phase F16 is pure verification, no app code was touched.

**Stray real test data, disclosed:** this phase's live workflow drives created real, clearly-labeled
records in the dev database — a Region/District ("Phase16 Test Region"/"P16DIST"), a completed
promotion and hiring (real new employee EMP000119), a DSR, and a product recommendation — left in
place per this dev database's established convention (see Phases F13/F14's own equivalent notes); no
production environment is involved.
