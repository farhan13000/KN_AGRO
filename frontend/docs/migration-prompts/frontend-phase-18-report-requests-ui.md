# Frontend Migration Phase 18 — Report Requests UI (ask-then-answer, distinct from DSR)

**Depends on:** Backend Phase 12 (`reportRequests` module — already built, verified, live).
Frontend Phase F10 (DSR — a related but distinct module; do not merge the two). **Type:** wholly
new — zero frontend UI exists for this workflow; the only existing references are the audit-action
enum mirroring the backend's constant names and a disclosed "no destination" note in the
notification deep-link resolver (Phase F13).

**Read first — do not confuse this with DSR:** DSR (`features/dsr`, built in Phase F10) is a
recurring, self-initiated daily record — nobody "requests" one, an FO/SO just submits it every day.
Report Requests (`backend/src/modules/reportRequests`, mounted at `/reports`) is the opposite
shape: a manager tier explicitly **asks** a specific employee for a specific report
(`POST /reports/requests`, gated `REPORTS_REQUEST`), the employee **starts** and **submits** an
answer to that specific request (`POST /requests/:id/start`, `POST /requests/:id/submit`, gated
`REPORTS_SUBMIT`), and the requester **reviews** or **rejects** it (`POST /requests/:id/review`,
`POST /requests/:id/reject`, gated `REPORTS_REVIEW`) — a rejected one can be **resubmitted**
(`POST /requests/:id/resubmit`). Confirmed against `seedRoles.js`:

- `REPORTS_READ_SELF`/`REPORTS_SUBMIT`: every seeded role with an Employee record.
- `REPORTS_READ_TEAM`/`REPORTS_REQUEST`/`REPORTS_REVIEW`: legacy SALES_MANAGER, GM, RM, ASM
  (**not** SO, **not** FO — a narrower tier than Attendance/Leave's team permissions).
- `REPORTS_MANAGE`: nobody directly — SA wildcard only.

---

## Prompt 18.1 — Report Requests API layer

```
Add a `REPORT_REQUESTS` endpoint block to `apiConfig.js` — note the backend mounts this module at
`/reports`, not `/report-requests` (check `routes/index.js` directly to confirm before wiring
anything). Paths, from `BACKEND/backend/src/modules/reportRequests/reportRequest.routes.js`:
POST /requests, GET /requests/me, GET /requests/team, GET /requests (admin), GET /requests/summary,
POST /requests/:id/start, POST /requests/:id/submit, POST /requests/:id/resubmit,
POST /requests/:id/review, POST /requests/:id/reject.

Create `src/features/reportRequests/services/reportRequestApi.js` with matching functions. Check
`reportRequest.model.js` and `reportSubmission.model.js` directly for the real field shapes
(`type`, `title`, `description`, `dueDate`, `priority`, `status`, `submissionText`, `attachments`,
plus the separate `reportSubmission` record for resubmission history) before building the next two
prompts — this model has more moving parts than DSR's, don't guess at it.
```

**Acceptance criteria:** API functions exist and match the backend's actual routes/permissions
exactly.

---

## Prompt 18.2 — Requester side: create a request, review/reject submissions

```
Build `ReportRequestCreateDialog.jsx` (title/description/assignedTo employee picker — reuse
whatever manager-scoped employee picker `features/employees` or `features/hiring` already
established for "pick one of my downline," don't build a new one/type/dueDate/priority — check
`REPORT_PRIORITY`'s real enum values in `reportRequest.constants.js`) and
`ReportRequestListPage.jsx` (`GET /requests/team`, filterable by status) with Review/Reject row
actions gated `REPORTS_REVIEW`, for the Sales Manager portal (legacy SALES_MANAGER, GM, RM, ASM
only — SO and FO get neither, confirmed against seedRoles.js). Reject requires a reason — check
`rejectReportSchema` directly for whether it's actually required.

Wire the Create action behind `REPORTS_REQUEST` and add a nav entry ("Report Requests").
```

**Acceptance criteria:** a real report request is created targeting a real downline employee;
Review/Reject transition its status correctly; a reviewer outside that employee's actual chain
gets the backend's 403, not a frontend-hidden button.

---

## Prompt 18.3 — Assignee side: start, submit, resubmit

```
Build `MyReportRequestsPage.jsx` (`GET /requests/me`) for both the Employee and Sales Manager
portals (every seeded role holds `REPORTS_READ_SELF`/`REPORTS_SUBMIT`) showing each request's
status with the right action available per status: Start (PENDING -> IN_PROGRESS), Submit
(IN_PROGRESS -> SUBMITTED, a text + optional attachments form matching `submissionText`/
`attachments`), and Resubmit (only visible on a REJECTED request, showing the requester's own
`rejectionReason` so the employee knows what to fix). Add a nav entry ("My Reports" or similar —
check there's no label collision with DSR's own "My DSRs" nav entry, keep them visually distinct).
```

**Acceptance criteria:** a real request walks PENDING -> IN_PROGRESS -> SUBMITTED through the UI;
a rejected one can be resubmitted and shows the original rejection reason inline.

---

## Prompt 18.4 — Admin: company-wide view

```
Add `AllReportRequestsPage.jsx` (`GET /requests`, gated `REPORTS_MANAGE`) to the Super Admin
portal. `REPORTS_MANAGE` is held by nobody directly in `seedRoles.js` — SA wildcard only — disclose
this on the page itself, matching the established convention (e.g.
`SuperAdminAuditLogListPage`/`SuperAdminAllDSRListPage`) rather than leaving it unexplained.
```

**Acceptance criteria:** the company-wide list renders for SA with real filters
(status/type/requester, matching whatever `reportListQuerySchema` actually supports).

---

## Stop and report

After Prompt 18.4, walk one real report request end-to-end: a GM requests one from a real
downline FO, the FO starts and submits it, the GM rejects it with a reason, the FO resubmits, the
GM reviews and accepts — confirm every status transition renders correctly in the UI at each step.

## Phase F18 exit criteria

- A manager tier (legacy SALES_MANAGER, GM, RM, ASM) can request a report from a specific downline
  employee and review/reject what comes back.
- Every role can see and act on report requests assigned to them (start/submit/resubmit).
- SA can see every report request company-wide.
- This module is visibly distinct from DSR in the UI — no shared page, no ambiguous nav labeling.

---

## IMPLEMENTED AND VERIFIED

**Built `src/features/reportRequests/` from scratch**, every model field, route path,
response-wrapper key, and permission grant verified directly against backend source — this model
had more real nuance than DSR's, exactly as the doc warned:

- **A real, disclosed scope difference from Attendance/Leave, found while wiring the "assigned to"
  picker:** `ReportRequestService.createReportRequest` restricts `assignedTo` to the requester's
  **direct reports only** (`"You may only request a report from your own direct reports"`),
  confirmed directly in the service — genuinely narrower than Attendance/Leave's full-downline team
  scope. This makes `features/employees`' existing `useMyTeam` (direct reports, already used by the
  Team page) the *correct* picker here, not a limitation to work around — the Stop-and-report's own
  "GM requests one from a real downline FO" walkthrough was adjusted to a real direct-report **RM**
  instead, matching the backend's actual, deliberate constraint.
- The request body field is **`submissionText`**, not `text` (that name is reserved for the
  internal `ReportSubmission` history record's own field) — confirmed directly in
  `submitReportSchema`/`resubmitReportSchema`, not assumed.
- `rejectReportSchema` requires `rejectionReason`; `reviewReportSchema` leaves `reviewComment`
  optional — one `ReportDecisionDialog` handles both, mirroring Phase F17's `LeaveDecisionDialog`
  pattern.
- **Attachments are real but metadata-only** (`reportAttachmentSchema`: `url` required, http(s)
  only, no file bytes anywhere in this codebase) — built as an optional name+URL pair per
  submission, not a file picker, since no upload integration exists to pick a file *for*.
- **`CANCELLED` is a real enum value with no route to trigger it** — no cancel endpoint exists on
  the backend at all. The status badge renders it correctly if it were ever set some other way, but
  no "Cancel Request" UI was built, since there's nothing for it to call.
- **`requestedBy`/`requestedByEmployee` are never populated by any list endpoint** (confirmed
  directly in `reportRequest.service.js` — only `assignedTo` gets `.populate()`'d), so "requested
  by" is not shown anywhere in this UI — a real, disclosed backend limitation, not an oversight.

**Wired in:** 5 new pages (My Reports × 3 portals, Team Report Requests for manager tiers, one
company-wide Admin view) matching the real, narrower permission tiers (`REPORTS_READ_TEAM`/
`REQUEST`/`REVIEW` held by legacy SALES_MANAGER/GM/RM/ASM only — **not** SO, unlike every other
Phase F17 module); nav entries in all three navigation arrays, visually and semantically distinct
from DSR's own nav entries ("My Reports"/"Report Requests" vs. DSR's "My DSRs"/"Team DSRs");
`REPORTS_*` permission constants (deferred by Phase F01 until this phase needed them).

### Verification

Real browser (Playwright/Chromium) against the live dev backend and the real Phase 17 seeded org —
**15/15 checks passed**, zero uncaught page errors throughout, walking the full 6-step chain the
Stop-and-report asks for, start to finish:

- GM (Aarav Kulkarni) requested a real report from his real direct-report RM (Vivaan Kulkarni) —
  PENDING.
- RM started it — IN_PROGRESS — then submitted real report text — SUBMITTED.
- GM rejected it with a real reason ("Please break this down by district, not just region.") —
  REJECTED.
- RM's My Reports correctly showed that exact rejection reason inline; the Resubmit dialog also
  surfaced it for context before resubmitting — SUBMITTED again.
- GM reviewed (approved) it — REVIEWED, the terminal-success state.
- SA's company-wide view rendered the same real, now-REVIEWED request; the page correctly
  discloses `REPORTS_MANAGE` is SA-wildcard-only.
- Permission boundary confirmed for SO: nav shows "My Reports" (holds `REPORTS_READ_SELF`) but
  correctly omits "Report Requests" (lacks the team-tier permissions); a direct URL to the
  team-scoped route is backend-gated to `/unauthorized`, not just button-hidden.

Two initial test-script failures on the SO checks were investigated rather than assumed — a direct
curl against the backend confirmed the real 403 was already correct; the frontend check itself was
racing ahead of the auth context finishing its load right after login (the same class of timing
issue Phases F14/F16/F17 already hit), fixed by waiting for real dashboard content before reading
nav/permission state. Not a product bug.

**Cleanup confirmed:** all `tmp-verify-phase18*.mjs` scripts deleted, `playwright` uninstalled,
`package-lock.json` reverted, both dev servers stopped (restoring the freed-ports state). `npm run
build` — clean, no errors. `git status` shows only this phase's own new files.
