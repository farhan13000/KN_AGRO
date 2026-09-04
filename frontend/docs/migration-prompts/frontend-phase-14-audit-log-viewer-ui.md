# Frontend Migration Phase 14 — Audit Log Viewer UI

**Depends on:** Backend Phase 16. Frontend Phase F01. **Type:** wholly new — no audit-log UI exists
anywhere in this frontend today (confirmed by Phase F00's audit).

---

## Prompt 14.1 — Audit API and list view

```
Add `AUDIT` endpoints to `apiConfig.js` (check whatever
`BACKEND/backend/src/modules/audit/audit.routes.js` exposes for reading — list/filter by
entityType/entityId/actorId/action/date-range).

Create `src/features/audit/services/auditApi.js#listAuditLogs(query)`. Build
`AuditLogListPage.jsx` — a filterable, paginated table (actor, action, entity type/id, timestamp,
and the bounded `changes` array from the backend's Phase 16 work rendered as a small "field: before
-> after" list, not a raw JSON dump). Gate behind whatever permission the backend uses for audit
read access (likely SA/OA-only — check the actual route's `authorize()` call, don't assume).
```

**Acceptance criteria:** the list renders real audit entries with correctly-formatted bounded diffs
for entries that have a `changes` array, and falls back gracefully (showing whatever `metadata`
scalars exist) for older entries that predate the `changes` field.

---

## Prompt 14.2 — Entity-scoped audit trail

```
Add a small "Audit Trail" tab/section (reusing Prompt 14.1's list component, filtered to that
entity) to the detail pages that most benefit from it per the backend's own Section 36 checklist:
Employee detail (role changes, transfers, approvals), Promotion detail, District detail (assignment
history), Hiring Request detail. Each just calls the same list endpoint with an
`entityType`/`entityId` filter.
```

**Acceptance criteria:** opening an Employee's Audit Trail tab shows their role changes and
transfers with correct before/after values, cross-checked against one action you performed earlier
in this plan (e.g. a promotion from Phase F06) and can independently confirm shows up correctly.

---

## Stop and report

After Prompt 14.2, cross-check one real audit entry (from an action performed in an earlier phase
of this plan) end-to-end in the new viewer.

## Phase F14 exit criteria

- A permission-gated audit log viewer exists, both as a global list and as entity-scoped trails on
  the highest-value detail pages, correctly rendering bounded diffs.

---

## IMPLEMENTED AND VERIFIED

**Permission check, per this doc's own "don't assume" instruction:** read `audit.routes.js` directly
rather than trusting the doc's own "likely SA/OA-only" guess. Both routes share `AUDIT_READ`
(`audit.read`), and cross-checking `seedRoles.js` line by line (all 10 role blocks) confirms it is
held **only** via the SA/legacy SUPER_ADMIN `ALL_PERMISSIONS` wildcard — **not OA**, despite OA
otherwise sharing the Super Admin portal and getting nearly everything else SA-adjacent. The doc's own
guess was half right; verifying instead of assuming caught the OA half being wrong.

**Real backend gap found and fixed, disclosed before building anything:** `auditLog.model.js` has a
real `changes: [{field, before, after}]` array (Phase 16's bounded per-field diff, exactly what this
phase's Prompt 14.1 asks the list to render), and every Phase 16+ `recordAuditEvent` call site
already populates it — but `audit.serializer.js` never surfaced it on either the list or detail
response; the field was being silently dropped between the database and every API consumer. Since
this directly blocked this phase's own explicit acceptance criteria, and the fix is a two-line,
purely-additive, same-shape change to a read-only endpoint's serializer (no schema, storage, or
business-logic change — `changes` was already being written, just never read back out), it was fixed
in `backend/src/modules/audit/audit.serializer.js`: `changes: log.changes` added to both
`serializeAuditLogListItem` and `serializeAuditLogDetail`. Deliberately did **not** also add
`before`/`after`/`metadata` to the list serializer — that exclusion is the list endpoint's own
explicit, still-valid design decision (a many-row browse screen is the wrong place for a full
before/after dump), unrelated to the `changes` gap. Confirmed live via curl before and after the
edit; the dev server picked up the change immediately (hot reload), no restart needed.

**Built:** `AUDIT_READ` permission constant added (deferred by Phase F01). `src/features/audit/` —
`auditApi.js` (`listAuditLogs`/`getAuditLog`, matching `audit.routes.js` exactly),
`AUDIT_ACTIONS` (all 65 real enum values, grepped from `audit.constants.js`, not guessed — powers the
action filter dropdown; no per-action icon/label map like Notifications' — plain title-casing of the
real enum value is honest and can't drift), `AuditChangesList` (the core "field: before → after"
renderer — `changes` when present, falling back to scalar `metadata` keys per this phase's own
acceptance criteria, never a raw JSON dump), `AuditLogListView` (URL-search-param-driven filters —
search/action/entityType/entityId/from/to/sortOrder — + `Pagination`, mirroring `OrderListView`'s
established pattern exactly), `AuditLogTable`, and `AuditLogDetailModal` (an opt-in "Full record"
drill-down per row — the one place raw `before`/`after`/`metadata` JSON is shown, since a user
explicitly asked for it by clicking, unlike the default table/trail rendering).

Wired into the Super Admin portal only (`/super-admin/audit-log`, nav entry, route) — not the other
two portals, since `AUDIT_READ` is never held there; a permission-gated link only Super Admin can ever
see has no reason to exist in the Sales Manager or Employee portal's own routing.

**Prompt 14.2 — entity-scoped trails, with one real, disclosed gap in scope not method:** Employee
Detail and District Detail both have real per-record frontend routes, so both got a full
`AuditTrailSection` (reusing the same `useAuditLogList` call, filtered to that `entityType`/
`entityId`). Promotion and Hiring Request do **not** have per-record detail pages — Frontend Phase
F13 already found this (only a list/pipeline/approvals view exists for either) and this phase confirms
it again. Rather than skip Prompt 14.2's ask for those two entirely, built a smaller
`AuditTrailToggle` — a collapsed-by-default inline expander added directly to the real per-record
`PromotionCard`/`HiringPipelineView` list rows (each already has a real `_id` to filter by), fetching
only once expanded. This gets genuine per-record audit trails for Promotion and Hiring Request without
inventing a route the rest of the frontend doesn't have.

**Verification:** real browser (Playwright/Chromium) against the live dev backend and its real
accumulated audit history (1384+ entries from every earlier phase's own live testing) —
**13/13 checks passed**:

- SA: the global Audit Log page renders; filtering by `EMPLOYEE_TRANSFERRED` surfaces the exact real
  transfer performed live during Phase F13's own verification (Vivaan Kapoor → Yash Chauhan), showing
  a bounded `Manager: <before> → <after>` diff — not raw JSON. "Full record" opens the modal and shows
  the entry's real Metadata JSON.
- **Explicit cross-check, per the Stop-and-report's own ask:** opening that same employee's (Vivaan
  Kapoor) Employee Detail page shows the identical `EMPLOYEE_TRANSFERRED` entry with the identical
  `Manager:` before/after values in the entity-scoped Audit Trail section — confirmed independently,
  not just re-reading the same list view.
- A real, currently-existing Promotion (Ishaan Kulkarni, `fo → so`) shows both its real
  `PROMOTION_RECOMMENDED` and `PROMOTION_APPROVED` audit entries via the inline `AuditTrailToggle` on
  its `PromotionCard`.
- A real Hiring Request shows its real `HIRING_REQUESTED` entry via the same toggle pattern on
  `HiringPipelineView`.
- **Permission gate proven, not assumed:** logged in as GM (holds every other permission on this
  page but never `AUDIT_READ`) viewing the exact same shared `HiringPipelineView` component in the
  Sales Manager portal — no "Audit trail" toggle renders, no "Audit Log" nav link renders, and direct
  navigation to `/super-admin/audit-log` redirects to `/unauthorized`.
- Zero uncaught page errors across every persona/run.

**Cleanup confirmed:** `tmp-verify-phase14.mjs` deleted, `playwright` uninstalled,
`package-lock.json` reverted. `npm run build` — clean, no errors, in both repos (`backend`'s own
lint/test suite was not run as part of this frontend-phase verification pass — the change there is a
two-line, read-only-endpoint serializer addition, not new backend logic).
