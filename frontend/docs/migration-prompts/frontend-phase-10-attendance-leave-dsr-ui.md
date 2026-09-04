# Frontend Migration Phase 10 — Attendance/Leave/ReportRequest Verification + New DSR UI

**Depends on:** Backend Phase 12. Frontend Phase F02. **Type:** verification (Attendance, Leave,
ReportRequest — same "backend already fixed the scope, just confirm the frontend doesn't re-narrow
it" pattern as Phase F09) + one wholly new module (DSR).

---

## Prompt 10.1 — Verify Attendance/Leave/ReportRequest team views show the full downline

```
Same check as Phase F09's Prompt 9.1, applied here: confirm the existing "team attendance"/"team
leave requests"/"team reports" views render whatever the backend now returns (full downline, per
backend Phase 12's scope sweep) without any client-side filter re-narrowing it to direct reports
only. Report findings even if nothing needed changing.
```

**Acceptance criteria:** documented confirmation, same bar as Phase F09's Prompt 9.1.

---

## Prompt 10.2 — DSR API layer

```
Add `DSR` endpoints to `apiConfig.js` (check `BACKEND/backend/src/modules/dsr/dsr.routes.js`:
`POST /`, `GET /me`, `GET /team`, `GET /`, `POST /:id/review`, `POST /:id/acknowledge`).

Create `src/features/dsr/services/dsrApi.js` with matching functions. Model this feature's whole
structure on `src/features/attendance/` if that exists as a frontend feature already (check first),
since the backend's own design note says DSR is structurally closer to Attendance (a recurring,
self-initiated daily record) than to ReportRequest (ask-then-answer) — if no `features/attendance/`
exists on the frontend yet (attendance might currently live inside a portal's pages rather than as
its own feature module), use `features/reportRequests/` as the structural template instead, but
keep DSR's OWN daily-submission behavior (see Prompt 10.3), don't borrow ReportRequest's
request-then-respond shape.
```

**Acceptance criteria:** API functions exist and match the backend's actual routes/permissions
(`DSR_CREATE`, `DSR_READ_SELF`, `DSR_READ_TEAM`, `DSR_READ_ALL`, `DSR_REVIEW`).

---

## Prompt 10.3 — Submit DSR form (FO/SO)

```
Build `DSRSubmitPage.jsx` — a form matching the backend's model fields (field activity:
customerVisits/newCustomerVisits/followUpVisits/dealerVisits/marketVisits; lead activity:
newLeadsGenerated/leadsFollowedUp/leadsConverted/leadsLost; sales: ordersGenerated/salesAmount/
productsSold/newCustomers; notes: keyActivities/issues/customerFeedback/competitorInfo/
nextDayPlan/remarks — all optional except what the backend model marks required, check the model
directly rather than guessing which fields are mandatory). Money field (`salesAmount`) must convert
to/from paise the same way every other money field in this codebase already does — check how
`features/quotations` or `features/payroll` (if it exists as a frontend feature) handles this
conversion and match it exactly, don't invent a new convention.

Submitting a second DSR for today must show the backend's specific 409 message ("already submitted
today" or whatever it actually says), not a generic error. Add this as a nav item/dashboard action
for FO/SO (gated `DSR_CREATE`) in the Employee and Sales Manager portals respectively.
```

**Acceptance criteria:** a valid DSR submits successfully once per day; a same-day duplicate attempt
shows the backend's specific rejection message.

---

## Prompt 10.4 — Review/acknowledge and team/all list views

```
Build `MyDSRListPage.jsx` (`GET /me`), `TeamDSRListPage.jsx` (`GET /team`, with Review/Acknowledge
row actions gated by `DSR_REVIEW` — same "let the backend's canManageEmployee-based 403 be
authoritative" posture as every other workflow phase in this plan; don't try to compute "is this
actually my report" on the frontend), and `AllDSRListPage.jsx` (`GET /`, gated `DSR_READ_ALL`, for
whichever roles hold company-wide DSR visibility per the backend's seeded bundle).

Review and Acknowledge are two SEPARATE actions on a DSR (SUBMITTED -> REVIEWED -> ACKNOWLEDGED,
per the backend's light two-step chain, deliberately not a formal approve/reject) — render both as
distinct buttons that appear/disappear based on the DSR's current status, not a single combined
"process" button.
```

**Acceptance criteria:** the SUBMITTED -> REVIEWED -> ACKNOWLEDGED flow is operable through the UI
for a real FO -> SO -> ASM (or above) chain; a reviewer outside that specific employee's chain gets
the backend's 403, not a frontend-hidden button that would have worked if clicked directly (i.e.
confirm the backend gate is real, don't rely solely on the button being hidden).

---

## Stop and report

After Prompt 10.4, submit one real DSR as an FO, review it as their SO, acknowledge it as the SO's
ASM, and confirm the status transitions correctly at each step in the UI.

## Phase F10 exit criteria

- Attendance/Leave/ReportRequest team views are confirmed to show the full downline.
- DSR submit/review/acknowledge is fully operable through the UI, matching the backend's light
  two-step (not formal approve/reject) review chain.

---

## IMPLEMENTED AND VERIFIED

### Prompt 10.1 — doc/reality conflict found, resolved with the user before proceeding

Prompt 10.1 assumes the existing "team attendance"/"team leave requests"/"team reports" views
already render the backend's now-fixed scope, and asks only to confirm they don't re-narrow it.
**No such views exist anywhere in this frontend.** A repo-wide search found zero references to
Attendance/Leave/ReportRequest outside one placeholder string on the Employee dashboard itself:
*"Attendance, DSR, leave, and payroll arrive in later phases."* No `src/features/attendance/`,
`leave/`, or `reportRequests/` module; no routes; no components. This is a different scale of gap
than Phase F08's single missing display — it's three entire missing feature modules, each roughly
DSR-sized on its own.

Flagged this to the user before proceeding (rather than silently either ballooning this phase's
scope by building three unplanned modules, or silently skipping verification work the doc assigned).
**Decision: DSR only this phase** (Prompts 10.2-10.4, as the doc's own "one wholly new module" framing
already anticipates), with this finding reported honestly instead of a fabricated pass. **Building
real Attendance/Leave/ReportRequest UI remains a real, open gap for a dedicated future phase** — not
absorbed into this one.

### Prompts 10.2-10.4 — DSR module

No `features/attendance/` or `features/reportRequests/` existed to use as a structural template
either (per the doc's own fallback instructions), so DSR was modeled on this migration's own most
recent, closest-shaped precedent instead: `features/salaryProposals/` (a permission-gated,
multi-stage status workflow) and `features/hiring/`'s `createHref`-button-on-the-list-page
convention for the submit action.

**Built:** `src/features/dsr/` — `dsrApi.js` (submit/listMyDSRs/listTeamDSRs/listAllDSRs/review/
acknowledge, matching `dsr.routes.js` exactly); `useMyDSRList`/`useTeamDSRList`/`useAllDSRList`/
`useDSRActions`; `DSRStatusBadge`, `DSRCard`, `DSRSubmitForm` (grouped Field Activity/Lead Activity/
Sales/Notes sections, every field optional per `dsr.model.js`'s own defaults — nothing guessed),
`DSRReviewDialog` (comment optional, matching `reviewDSRSchema`), `MyDSRListView`/`TeamDSRListView`/
`AllDSRListView`. Acknowledge needs no dialog (the backend accepts no body) — driven by the shared
`ConfirmDialog`, same pattern `SalaryProposalPipelineView`'s Approve/Finalize already established.
`salesAmount` needed no paise/rupees conversion — confirmed via `dsr.serializer.js` that, unlike
SalaryProposal's own responses, DSR's are already converted with `toRupees` consistently.

**Permission-to-page mapping, confirmed against `seedRoles.js` before wiring anything** (not
assumed): `DSR_CREATE`/`DSR_READ_SELF` → SO, FO only. `DSR_READ_TEAM` → GM, RM, ASM, SO.
`DSR_REVIEW` → ASM, SO only (GM/RM get read-only team visibility, no review/acknowledge actions —
matches the original design note: SO reviews their own FO's submissions, ASM acknowledges after).
`DSR_READ_ALL` → nobody directly seeded; reachable only via the SA wildcard. Pages built accordingly:
Employee portal gets Submit + My DSRs (FO); Sales Manager portal gets Submit + My DSRs + Team DSRs
(SO/ASM/RM/GM, with Review/Acknowledge only actually offered where `DSR_REVIEW` is held); Super Admin
portal gets one company-wide `AllDSRListPage` (SA in practice, per the confirmed permission
distribution — disclosed on the page itself, not left unexplained).

### Verification

Real browser (Playwright/Chromium) against the live dev backend and the real Phase 17 seeded org (a
full real FO→SO→ASM chain: Ishaan→Kabir→Aditya, plus their RM Vivaan and an entirely unrelated
different-branch ASM) — **14/14 checks passed**, walking one real DSR through the full chain exactly
as the Stop-and-report asks:

- FO submits a real DSR; a same-day resubmission attempt shows the backend's own specific 409
  ("already submitted"), not a generic error.
- An unrelated, different-branch ASM's own team list doesn't show this FO's DSR at all — confirming
  the backend's scope filtering, not a frontend hide.
- RM (holds `DSR_READ_TEAM` only) sees the DSR in their team list but has no Review action at all
  (lacks `DSR_REVIEW`) — read-only oversight, exactly as the seeded bundle intends.
- SO (the FO's real manager) reviews it: SUBMITTED → REVIEWED.
- **The actual point of the acceptance criteria — the backend gate confirmed real, not just a hidden
  button**: the SAME SO who just reviewed it is still *offered* the Acknowledge button (the frontend
  only checks permission + status, never "was it specifically me" — that's the backend's job) and
  clicking it produces the backend's real 403 ("the same manager who reviewed this DSR cannot also
  acknowledge it"), rendered inline, not swallowed.
- ASM (a different actor, SO's own manager) acknowledges it: REVIEWED → ACKNOWLEDGED, completing the
  full chain.
- Zero uncaught page errors across the whole run.

**Cleanup confirmed:** every test-created DSR document removed after verification; the FO's one
genuinely pre-existing DSR (from earlier Phase 18 regression testing, a different calendar day) was
left untouched. `npm run build` — clean, no errors.
