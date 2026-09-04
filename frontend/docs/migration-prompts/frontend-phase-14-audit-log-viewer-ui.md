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
