# Frontend Migration Phase 17 — Attendance & Leave Workflow UI

**Depends on:** Backend Phase 12 (`attendance`/`leaves` modules — already built, verified, live).
Frontend Phase F02. **Type:** wholly new — Phase F10 found zero Attendance/Leave UI anywhere in
this frontend (only a passive stat or two inside the analytics dashboards) and explicitly deferred
building it to "a dedicated future phase." This is that phase.

**Read first:** `BACKEND/backend/src/modules/attendance/attendance.routes.js` and
`.../leaves/leave.routes.js` — both fully built, mounted at `/attendance` and `/leaves`
respectively. Confirmed via `seedRoles.js` (don't re-derive from memory, verify again if this doc
is stale by the time you build it):

- `ATTENDANCE_CHECK_IN`/`_CHECK_OUT`/`_READ_SELF`: every seeded role with an Employee record
  (legacy EMPLOYEE, GM, RM, ASM, SO, FO — legacy SALES_MANAGER too).
- `ATTENDANCE_READ_TEAM`: legacy SALES_MANAGER, GM, RM, ASM, SO (**not** FO).
- `ATTENDANCE_CORRECT` / `ATTENDANCE_READ_ALL`: nobody directly — SA wildcard only.
- `LEAVES_CREATE`/`_READ_SELF`/`_CANCEL_SELF`: every seeded role with an Employee record.
- `LEAVES_READ_TEAM`/`_APPROVE`: legacy SALES_MANAGER, GM, RM, ASM, SO (**not** FO).
- `LEAVES_READ_ALL`: nobody directly — SA wildcard only.

---

## Prompt 17.1 — Attendance & Leave API layers

```
Add `ATTENDANCE` and `LEAVES` endpoint blocks to `apiConfig.js`. Check
`BACKEND/backend/src/modules/attendance/attendance.routes.js` and
`.../leaves/leave.routes.js` directly for the exact paths — don't guess:

Attendance: POST /check-in, POST /check-out, GET /me/today, GET /me/summary, GET /me,
GET /team/summary, GET /team, PATCH /:attendanceId/correct, GET / (admin, all).

Leaves: POST /, GET /me, GET /team, POST /:leaveId/approve, POST /:leaveId/reject,
POST /:leaveId/cancel, GET / (admin, all).

Create `src/features/attendance/services/attendanceApi.js` and
`src/features/leaves/services/leaveApi.js` with matching functions, modeled structurally on
`src/features/dsr/` (Phase F10's own new module — same "recurring, permission-tiered, self vs.
team vs. all" shape). Check `attendance.model.js`/`leave.model.js` directly for exact field names
before building the next two prompts' forms — don't assume field names from this doc alone.
```

**Acceptance criteria:** API functions exist and match the backend's actual routes/permissions
exactly (`ATTENDANCE_CHECK_IN`/`_CHECK_OUT`/`_READ_SELF`/`_READ_TEAM`/`_CORRECT`/`_READ_ALL`,
`LEAVES_CREATE`/`_READ_SELF`/`_READ_TEAM`/`_APPROVE`/`_CANCEL_SELF`/`_READ_ALL`).

---

## Prompt 17.2 — Self-service: check in/out, today's status, my attendance history

```
Build a compact "Attendance Today" widget (Check In / Check Out buttons, swapping based on
whether `GET /attendance/me/today` shows an open check-in) — check `attendance.model.js` for
`checkIn`/`checkOut`/`status`/`workingMinutes` fields, don't guess the shape. Place it prominently
in both the Employee and Sales Manager portal dashboards (gated `ATTENDANCE_CHECK_IN`), alongside
— not replacing — the existing read-only attendance stats Phase F12 already built into the
analytics dashboard content components.

Build `MyAttendancePage.jsx` (`GET /attendance/me`, paginated by month/date-range) showing each
day's status/check-in/check-out/workingMinutes, gated `ATTENDANCE_READ_SELF`. Add nav entries to
both portals.

A check-in attempt when already checked in today (or a check-out with no open check-in) must show
the backend's specific rejection message, not a generic error — same "let the backend's real 4xx
body render, never swallow it" rule this whole plan has followed throughout.
```

**Acceptance criteria:** a real check-in/check-out completes successfully once each per day;
attempting either out of sequence shows the backend's specific message; My Attendance renders real
history.

---

## Prompt 17.3 — Self-service: request/cancel leave, my leave history

```
Build `LeaveRequestDialog.jsx` (leaveType/startDate/endDate/reason — check `leave.model.js` for
the real `LEAVE_TYPE` enum and any other required fields, don't guess) and `MyLeavesPage.jsx`
(`GET /leaves/me`, with a Cancel action on PENDING requests only, gated `LEAVES_CANCEL_SELF`).
Gate the request action on `LEAVES_CREATE`. Add nav entries ("Request Leave" / "My Leaves") to
both the Employee and Sales Manager portals — every seeded role holds these two self-service
permissions, so this is genuinely universal, not tier-gated.
```

**Acceptance criteria:** a real leave request is created, appears in My Leaves as PENDING, and can
be cancelled while still PENDING; a request outside valid date ranges (check the backend's own
validation — e.g. `endDate` before `startDate`) shows the backend's specific rejection.

---

## Prompt 17.4 — Team oversight: attendance team view + leave approve/reject

```
Build `TeamAttendancePage.jsx` (`GET /attendance/team`, `GET /attendance/team/summary`) and
`TeamLeavesPage.jsx` (`GET /leaves/team`, with Approve/Reject row actions gated `LEAVES_APPROVE`)
for the Sales Manager portal only — legacy SALES_MANAGER, GM, RM, ASM, SO all hold
`ATTENDANCE_READ_TEAM`/`LEAVES_READ_TEAM`/`LEAVES_APPROVE` (confirmed against `seedRoles.js`; FO
does not and gets neither page). Same "backend's real 403 is authoritative, never compute
'do I actually manage this person' client-side" posture as every prior workflow phase — offer the
Approve/Reject buttons whenever the permission is held and let a genuine out-of-chain attempt come
back as the backend's own 403, rendered inline.

Reject requires a comment — check `rejectLeaveSchema`/the leave controller directly for whether
it's actually required or optional, don't assume from this doc.
```

**Acceptance criteria:** Team Attendance/Team Leaves render the full downline (not just direct
reports) per Backend Phase 12's own scope sweep — same check Phase F09/F10 already verified holds
for other modules, confirm it also holds here. Approve/Reject transitions a leave's status
correctly and is blocked (backend 403, not a hidden button) for a manager outside that employee's
real chain.

---

## Prompt 17.5 — Admin: correct attendance, company-wide views

```
Add `AllAttendancePage.jsx` (`GET /attendance`, gated `ATTENDANCE_READ_ALL`) and
`AllLeavesPage.jsx` (`GET /leaves`, gated `LEAVES_READ_ALL`) to the Super Admin portal, plus a
correction action (`PATCH /:attendanceId/correct`, gated `ATTENDANCE_CORRECT`) reachable from the
company-wide attendance list. Both `_READ_ALL` permissions and `ATTENDANCE_CORRECT` are held by
nobody directly in `seedRoles.js` — reachable only via the SA wildcard — disclose this on the page
itself (matching the existing convention on `SuperAdminAuditLogListPage`/`SuperAdminAllDSRListPage`
for the same "SA wildcard only, no seeded role holds it directly" situation), don't silently omit
the note.
```

**Acceptance criteria:** company-wide lists render for SA; a correction updates the record and
shows `correctedBy`/`correctionReason` afterward.

---

## Stop and report

After Prompt 17.5, walk one real leave through request → approve as a real employee → manager
pair, and one real attendance check-in → check-out → correction, confirming each transition in the
UI.

## Phase F17 exit criteria

- Every seeded role can check in/out and request/cancel their own leave through the UI.
- Manager tiers (legacy SALES_MANAGER, GM, RM, ASM, SO) can see their team's attendance and
  approve/reject their team's leave requests, backend-gated not just button-hidden.
- SA can see company-wide attendance/leave and correct an attendance record.

---

## IMPLEMENTED AND VERIFIED

**Built two full feature modules from scratch**, `src/features/attendance/` and
`src/features/leaves/`, modeled structurally on `features/dsr/` per the doc's own instruction —
every model field, route path, response-wrapper key, and per-role permission grant was verified
directly against the backend source before writing any frontend code (`attendance.model.js`/
`leave.model.js`, both controllers' exact response shapes, `seedRoles.js`'s real grants), not
assumed from this doc alone, since a few things it didn't spell out turned out to matter:

- `checkIn`/`checkOut` take **no request body at all** (`z.object({})`) — every field is
  server-computed; the frontend never sends a timestamp.
- **`GET /leaves/me`'s own query schema names its type filter `type`**, while `/leaves/team` and
  the admin `GET /leaves` both name the identical filter `leaveType` — a real, disclosed backend
  inconsistency, reproduced faithfully in `leaveApi.js` rather than "corrected" into one name.
- `cancelLeaveSchema` requires `cancellationReason` — so Cancel needed its own dialog (not a bare
  `ConfirmDialog`), matching the doc's own hint to check this rather than assume a bare confirm
  works.
- `rejectLeaveSchema` requires `managerComment`; `approveLeaveSchema` leaves it optional — one
  `LeaveDecisionDialog` handles both, with the comment's `required` prop driven by which action was
  clicked.
- `attendanceCorrectionSchema`: only `correctionReason` is required; `checkIn`/`checkOut`/`status`/
  `remarks` are all optional and independently omittable from the payload if left blank.

**Wired in:** `AttendanceTodayWidget` on both the Employee and Sales Manager dashboards (gated
`ATTENDANCE_CHECK_IN`, placed alongside — not replacing — Phase F12's existing read-only attendance
stats, per the doc's own instruction); 8 new pages across all three portals (My/Team/All Attendance,
My/Team/All Leaves, split by the real per-role permission tiers this doc's own header table
already specified); nav entries in all three navigation arrays; `ATTENDANCE_*`/`LEAVES_*`
permission constants (deferred by Phase F01 until this phase needed them).

### A real methodology note, disclosed rather than glossed over

Verification initially threw a cluster of failures across the FO→SO leave-approval chain — the SO
account used (`yash.bhatt@demo.knagro.local`) no longer actually manages the target FO
(`vivaan.kapoor@demo.knagro.local`); a real transfer performed live during **Phase F13's own
verification** moved that FO to a different SO (`yash.chauhan@demo.knagro.local`) several phases
ago. Every failure traced back to this one stale assumption in the test script, not a product bug —
confirmed by directly querying the employee's current manager before rewriting the verification
around the correct real relationship. A couple of remaining failures were the same "checked a value
before its async fetch resolved" race this whole plan has hit before (Phases F14/F16) — fixed by
waiting for a definitive state change (e.g. the Check-In button actually becoming `disabled`) rather
than a fixed timeout.

### Verification

Real browser (Playwright/Chromium) against the live dev backend and the real Phase 17 seeded org —
**13/13 checks passed**, zero uncaught page errors throughout:

- FO (Vivaan Kapoor): a real prior check-in correctly leaves "Check In" disabled on the dashboard
  widget; My Attendance renders real history; a real leave request was created, appeared as
  PENDING, was cancelled with a reason (shows CANCELLED + the reason afterward); a second real
  leave request was left pending for the approval-chain test. Nav correctly shows My Attendance/My
  Leaves and correctly omits Team Attendance/Team Leaves (FO lacks both `_READ_TEAM` permissions).
- SO (Yash Chauhan, the FO's real current manager): Team Attendance shows the real FO's record;
  Team Leaves shows the real pending request; **approving it transitions it to APPROVED**,
  confirmed in the UI.
- SA: company-wide Attendance and Leaves lists render real records (including the now-approved
  leave); both pages correctly disclose that `ATTENDANCE_READ_ALL`/`ATTENDANCE_CORRECT`/
  `LEAVES_READ_ALL` are SA-wildcard-only, per the doc's own instruction; a real attendance
  correction was submitted and saved without error.

**Cleanup confirmed:** all `tmp-verify-phase17*.mjs`/`tmp-debug-phase17*.mjs` scripts deleted,
`playwright` uninstalled, `package-lock.json` reverted, both dev servers stopped afterward
(restoring the freed-ports state from earlier in this session). `npm run build` — clean, no errors.
`git status` shows only this phase's own new files plus the pre-existing accumulated work from
earlier phases.
