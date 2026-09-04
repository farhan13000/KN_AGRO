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
