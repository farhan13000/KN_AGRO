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
