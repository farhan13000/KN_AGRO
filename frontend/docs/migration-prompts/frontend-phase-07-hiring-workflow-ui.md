# Frontend Migration Phase 7 — Hiring Workflow UI

**Depends on:** Backend Phase 8 (Hiring Workflow — check it's actually implemented and verified
before starting; as of this plan's writing it is not yet built). Frontend Phases F01, F03.
**Type:** new feature, retires an existing public flow.

**What this replaces:** the backend's Phase 8 retires self-registration outright — no public action
may ever create a working User/Employee again; hiring always runs Request -> Process -> Review ->
Approve -> Complete. This frontend phase must retire the matching public UI
(`src/auth/pages/EmployeeRegistration/EmployeeRegistrationPage.jsx`,
`src/auth/pages/RegistrationPending/RegistrationPendingPage.jsx`, their routes in `AppRouter.jsx`,
and the "Register" link on `LoginPage.jsx`) and replace it with an internal HiringRequest workflow.

---

## Prompt 7.1 — Confirm backend readiness and retire self-registration

```
Before writing any new code: confirm `BACKEND/backend/src/modules/hiring/` exists and its own
migration-phase-08 doc has an "IMPLEMENTED AND VERIFIED" section (same convention every completed
backend phase uses). If it doesn't exist yet, STOP — do not start this phase against a backend that
isn't there; report back and come back once it's built.

Once confirmed: grep the whole frontend for callers of the self-registration endpoint/route
(`EmployeeRegistrationPage`, `RegistrationPendingPage`, whatever API call they make) exactly the
way the backend's own Prompt 8.3 asked it to check server-side. Remove the routes from
`AppRouter.jsx`, delete both page components, and remove the "Register" link from `LoginPage.jsx`.
Do not leave a dead, unreachable route sitting around — either the files are gone, or (if you find
something still depends on them that you're not sure is safe to remove) stop and report rather than
guessing.
```

**Acceptance criteria:** no public route can create an account; the login page no longer offers a
self-registration path.

---

## Prompt 7.2 — HiringRequest API and creation UI

```
Add `HIRING` endpoints to `apiConfig.js` (check
`BACKEND/backend/src/modules/hiring/hiring.routes.js` for exact paths: create, list, get, process,
review, approve, reject, complete).

Create `src/features/hiring/services/hiringApi.js` with matching functions. Create
`HiringRequestCreatePage.jsx` — a form capturing candidate details (name/email/phone/resumeUrl —
a plain URL field, this codebase doesn't build file-upload infrastructure per the backend's own
note, match that), proposed role/region/district/manager (reuse Phase F03/F04's
region/district pickers and Phase F01's manager-candidate pattern). Gate behind
`PERMISSIONS.HIRING_CREATE`. Add a "Request Hire" nav item/button wherever RM/ASM (the roles
identifying hiring needs, per the backend's own design note) would naturally find it — likely the
Sales Manager portal's employee section.
```

**Acceptance criteria:** submitting a valid hiring request creates one at status REQUESTED and it's
visible in the list from Prompt 7.3.

---

## Prompt 7.3 — Hiring pipeline list and step actions

```
Build `HiringRequestListPage.jsx` (status-filterable list, permission `HIRING_READ`) and a detail
view showing the request's current status and the correct next action button for whoever's viewing
it, gated per-step:
- Process (OA) -> PROCESSING
- Review (GM, per the backend's "management review" stage) -> UNDER_REVIEW
- Approve (SA-only) -> APPROVED
- Reject (available at PROCESSING or UNDER_REVIEW) -> REJECTED
- Complete (SA/OA, only once APPROVED) -> opens a final form collecting the remaining employee
  fields the backend's `completeHiring` needs (`employeeCode`, `phone`, `dateOfJoining`, etc. — check
  `hiring.service.js#completeHiring`'s actual parameter list) and, on submit, creates the real
  Employee+User pair.

Render each action button only when BOTH the actor's permission allows it AND the request's current
status allows that transition (don't show "Approve" on a REJECTED request) — but still let the
backend's own 400/403 be the authoritative rejection if the two checks ever disagree; don't treat
client-side gating as a substitute for handling the backend's error response.
```

**Acceptance criteria:** a HiringRequest can be walked through every status in order via the UI,
ending in a real, working Employee+User account; attempting to skip a step (e.g. Complete before
Approve) is either not offered as a button or, if attempted directly, shows the backend's specific
rejection.

---

## Stop and report

After Prompt 7.3, walk one hiring request through the full pipeline in the browser and confirm the
resulting new employee can actually log in.

## Phase F07 exit criteria

- No frontend path creates an account outside the Hiring pipeline.
- The full Request -> Process -> Review -> Approve -> Complete flow is operable end-to-end through
  the UI.
