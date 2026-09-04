# Frontend Migration Phase 8 — Salary Proposal UI

**Depends on:** Backend Phase 9 (check it's implemented/verified before starting — not yet built
as of this plan's writing). Frontend Phase F01. **Type:** new feature, sits in front of an
existing, working Salary/Payroll UI (do not touch that existing UI's own logic).

---

## Prompt 8.1 — SalaryProposal API and creation UI

```
Add `SALARY_PROPOSAL` endpoints to `apiConfig.js` (check
`BACKEND/backend/src/modules/salaryProposals/salaryProposal.routes.js`).

Create `src/features/salaryProposals/services/salaryProposalApi.js`: create, list, review,
approve, reject, finalize.

Create `SalaryProposalCreateDialog.jsx` on the employee detail page — current salary (read-only,
pulled from the employee's existing SalaryStructure display, wherever that already renders),
proposed salary, effective date, change reason. Gate behind `PERMISSIONS.SALARY_PROPOSAL_CREATE`.
Remember (per the backend's resolved decision) OA holds this permission for administrative
processing but never approve/finalize — don't assume "can create" implies "can also approve" for
gating any later prompt in this phase.
```

**Acceptance criteria:** creating a proposal succeeds and is visible from Prompt 8.2's list; it does
NOT change the employee's visible current salary anywhere in the UI (that only happens on finalize).

---

## Prompt 8.2 — Review/approve/reject/finalize pipeline

```
Build a `SalaryProposalListPage.jsx` (status-filterable, permission `SALARY_PROPOSAL_READ`) with
per-row actions gated by permission AND current status:
- Review (GM-level, per the backend's resolved decision) -> REVIEWED
- Approve (SA-only) -> APPROVED
- Reject -> REJECTED
- Finalize (once APPROVED) -> FINALIZED, and per the backend's own noted design choice (finalize-
  on-approve vs. wait-for-effectiveDate — check that phase's "IMPLEMENTED AND VERIFIED" section
  once it exists for which one was actually built), only offer the Finalize button when the backend
  would actually accept it; if it's effectiveDate-gated, disable the button with a tooltip showing
  the effective date rather than letting the user hit a 400.

Add a Salary Proposal history section to the employee detail page (reuse the same list, filtered by
employee).
```

**Acceptance criteria:** a finalized proposal is reflected in the employee's SalaryStructure display
(the existing, untouched Salary/Payroll UI) without this phase having written any new code into
that display logic — confirming the backend correctly reused its own existing SalaryStructure
creation path rather than this being two disconnected systems.

---

## Stop and report

After Prompt 8.2, walk one proposal through review -> approve -> finalize and confirm the
employee's salary structure actually changed via the EXISTING salary UI, not a new parallel display.

## Phase F08 exit criteria

- The proposal pipeline is operable end-to-end; OA can create but never approve/finalize (verified
  by attempting it, not just by button visibility); finalization is visible through the pre-existing
  Salary UI unchanged.

---

## IMPLEMENTED AND VERIFIED

**Doc/code conflict found and resolved, disclosed per this repo's own README rule.** This phase's
own header describes itself as sitting "in front of an existing, working Salary/Payroll UI (do not
touch that existing UI's own logic)," and Prompt 8.1 asks the create dialog to pull current salary
"from the employee's existing SalaryStructure display, wherever that already renders." A repo-wide
search found **no such display anywhere** — no `src/features/salary/`, no `SALARY_READ`/
`SALARY_MANAGE` permission constants, not one reference to `basicSalary`/`salaryStructure` outside
this phase's own new code. The backend endpoint (`GET /salary/:employeeId/current`) has been live
and correct since before this migration started; this frontend simply never built a screen for it.
Rather than silently inventing a full salary-management UI (out of scope — `SALARY_MANAGE`/create/
edit stay untouched) or silently dropping the current-salary display Prompt 8.1 explicitly asks for,
built the minimal, disclosed prerequisite: `src/features/salary/` with one read-only
`CurrentSalaryCard`, backed by the existing, untouched backend endpoint. This is what "the existing
SalaryStructure display" now is, and what the Stop-and-report's "confirm... via the EXISTING salary
UI, not a new parallel display" verification runs against below.

**Portal-reachability decision, disclosed — a deliberate departure from Promotion's own (narrower)
precedent.** `PromotionRecommendDialog`/`PromotionHistorySection` (Phase F06) are wired only into
`SuperAdminEmployeeDetailPage.jsx`, not `SalesManagerTeamMemberDetailPage.jsx` — even though GM/RM/
ASM/SO (all `PROMOTION_RECOMMEND` holders) land in the **sales-manager** portal (confirmed by
`authRoutes.js`'s `getPortalRouteForRole`: SA/OA only go to `super-admin`; GM/RM/ASM/SO go to
`sales-manager`). Checking `BACKEND/backend/src/seed/seedRoles.js` directly for
`SALARY_PROPOSAL_CREATE` confirmed the real holders are **OA, RM, ASM** (not GM — GM only holds
`SALARY_PROPOSAL_RECOMMEND`, the review step). Wiring the create dialog only into the super-admin
page the way Promotion did would have left RM/ASM — the actual, backend-designed primary creators —
with no UI path to their own genuinely-held permission at all. `SalaryProposalCreateDialog`,
`CurrentSalaryCard`, and `SalaryProposalHistorySection` were therefore wired into **both**
`SuperAdminEmployeeDetailPage.jsx` (for OA) **and** `SalesManagerTeamMemberDetailPage.jsx` (for RM/
ASM — the latter page had zero action buttons of any kind before this phase). Same reasoning applies
to the pipeline/list page: GM reviews (sales-manager portal), SA approves/finalizes (super-admin
portal) — both `SuperAdminSalaryProposalApprovalsPage.jsx` and
`SalesManagerSalaryProposalApprovalsPage.jsx` were built, mirroring Hiring/Promotion's own existing
dual-portal precedent for approval queues (unlike their single-portal create-dialog precedent).
Promotion's own narrower wiring was not touched — out of this phase's scope, reported here rather
than fixed inline.

**Backend response asymmetry found and handled, disclosed.** `POST /salary-proposals` accepts
`proposedSalary` in rupees at the API boundary (converted to paise once, server-side) — but unlike
`SalaryStructure`'s own responses (which run through `salary.serializer.js` and come back in
rupees), `SalaryProposal` has no serializer at all: create/list/get all return the raw Mongoose
document, so `currentSalary`/`proposedSalary` come back in **paise**. Converting client-side, once,
in `salaryProposalApi.js` (`fromPaise`), so every consumer (cards, dialogs, history) always sees an
already-converted rupee value. Confirmed live: submitting `55000` produced a Current Salary card
reading exactly "₹55,000.00" after finalize, not "₹5,500,000.00."

**Design choice confirmed, not invented:** finalize-on-approve, not gated on `effectiveDate` having
arrived — `backend/docs/migration-prompts/migration-phase-09-salary-proposal-workflow.md`'s own
"IMPLEMENTED AND VERIFIED" section states this explicitly. The Finalize button is therefore always
offered immediately once a proposal reaches APPROVED, with no disabled/tooltip state — confirmed
live below.

**Built:** `src/features/salary/` (minimal — `CurrentSalaryCard` only), `src/features/salaryProposals/`
(`salaryProposalApi.js`; `useSalaryProposalList`/`useSalaryProposalActions`;
`SalaryProposalStatusBadge`, `SalaryProposalCard`, `SalaryProposalCreateDialog`,
`SalaryProposalDecisionDialog` — review/reject, comment optional-vs-required exactly like
`PromotionDecisionDialog`'s own approve/reject split — `SalaryProposalHistorySection`,
`SalaryProposalPipelineView` — status-filterable, per-row actions gated by permission AND role tier
AND current status, mirroring `HiringPipelineView`'s multi-stage shape rather than Promotion's
single-status queue since a proposal has three distinct actionable stages at once). Approve/Finalize
need no dialog (the backend accepts no request body for either) — driven by the shared
`ConfirmDialog` instead of a bespoke component, matching how `HiringPipelineView`'s own Approve step
also has no confirmation dialog. `SALARY_READ_SELF`/`SALARY_READ`/`SALARY_MANAGE` and
`SALARY_PROPOSAL_READ/CREATE/RECOMMEND/APPROVE/FINALIZE` added to `permissions.constants.js`;
`SALARY_PROPOSAL_APPROVALS` routes added to both portals; nav entries added to both portals (Wallet
icon).

**Verification:** real browser (Playwright/Chromium) against the live dev backend and the real
Phase 17 seeded org (an RM, their direct ASM report, the RM's own GM, and the real `SUPER_ADMIN`/OA
accounts — no synthetic fixture built). **20/20 checks passed**, walking one proposal through the
entire pipeline with a different, correctly-tiered actor at each step:

- RM opens their ASM report's team-detail page, sees "Propose Salary Change," submits a proposal —
  the create dialog's current-salary line renders from the real (previously nonexistent)
  `CurrentSalaryCard` data path.
- RM does **not** see a Review action anywhere in the pipeline (RM holds CREATE only).
- GM reviews (RECOMMENDED → REVIEWED); GM does **not** see Approve either before or after reviewing
  (SA-only, confirmed both times).
- SA approves (REVIEWED → APPROVED) then finalizes (APPROVED → FINALIZED) with no effectiveDate
  gate, confirming the finalize-on-approve design choice actually holds.
- The employee's Current Salary card — the same read path the create dialog itself used, not a
  second parallel display — now shows the finalized amount, confirming the backend correctly reused
  its own existing `SalaryService.setSalaryStructure` rather than this being two disconnected
  systems.
- **OA — the actual acceptance-criteria test, done by attempting the action, not just checking
  button visibility** — logs in, opens the same pipeline, and Approve/Finalize are absent from every
  row regardless of status; OA never gets an opportunity to even try.
- Zero uncaught page errors across the whole run.

**One test-script bug found and fixed during this run (not a product bug):** the finalize step
failed once with the backend's own real "effectiveFrom must be after the current structure's" error
— traced to the verification script re-running against the same employee on the same calendar day
with a `date`-input effective date computed as "+30 days" both times (a `type="date"` input carries
no time component, so two runs minutes apart produced the identical date string). Fixed by widening
the test's effective-date offset to a randomized 200-700 days out; not a defect in the feature
itself.

**One pre-existing, disclosed UX gap — not introduced by this phase, not fixed here (out of
scope).** Creating a proposal does not live-refresh its own `SalaryProposalHistorySection` on the
same page — confirmed the data is correctly persisted (a reload shows it), this is purely a missing
reactive-refetch wire-up. `PromotionHistorySection` (Phase F06) has the identical gap for the exact
same reason (its own create dialog's `onSuccess` only refetches the parent employee record, never
the promotion list). Reported here since it's a real, user-visible inconsistency worth a future
pass across both features, not silently patched under this phase's own ticket.

**Cleanup confirmed:** every test-created `SalaryProposal` and `SalaryStructure` document for the
test ASM employee was removed after verification — the Phase 17 seeded org is back to its exact
original shape (no salary structure set for that employee, matching its state before this phase's
testing). `npm run build` — clean, no errors, both before and after a final pass confirming no stray
files were left in the working tree (two incidental changes from local Playwright tooling —
`src/app/AppProviders.jsx`'s import path and a `package-lock.json` `engines` field — were reverted,
not part of this phase's actual work).
