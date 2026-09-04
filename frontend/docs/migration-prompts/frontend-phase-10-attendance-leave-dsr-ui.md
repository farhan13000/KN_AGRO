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
