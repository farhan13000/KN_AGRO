# Frontend Migration Phase 13 — Communication & Notifications UI

**Depends on:** Backend Phase 15. Frontend Phase F02. **Type:** extend existing — Notification/
Conversation/Message UI already exists and is mature; this widens who it lets you contact and adds
new notification-type handling. Do not rebuild the messaging UI itself.

---

## Prompt 13.1 — Widen the "who can I message" contact picker

```
Find wherever the current messaging UI restricts contact selection to "your direct manager or
direct report" (likely a contact-picker component filtering a people list — grep for anything
importing `conversationScope`-equivalent logic or hardcoding a 1-level manager/report check on the
frontend). Per the backend's Phase 15 widening, ANY two employees where one is an ancestor of the
other (full chain, not just adjacent tiers) may converse, plus OA/SA reachable by everyone
unconditionally.

If the frontend currently builds its own contact list by walking the org chart client-side, stop —
that duplicates a rule that's about to drift the moment the backend's own rule changed. Instead,
check whether the backend exposes a "who can I message" endpoint; if yes, use it directly. If no
such endpoint exists, this is a gap to report rather than a rule to re-implement client-side (re-
implementing `isSubordinate`/ancestor-chain logic in the frontend is exactly the kind of business-
rule duplication this whole migration is trying to eliminate) — the pragmatic stopgap is to let the
user attempt to start a conversation with anyone and show the backend's 403 if it's not allowed,
rather than trying to pre-filter a picker correctly.
```

**Acceptance criteria:** either a real "who can I message" endpoint now backs the contact picker, or
(if no such endpoint exists) a documented decision to fall back to attempt-and-let-backend-reject,
with the reasoning recorded.

---

## Prompt 13.2 — New notification types

```
The backend's Phase 15 adds new `NOTIFICATION_TYPE` values (hiring request created/approved/
rejected, promotion recommended/approved/rejected, employee transferred, district assignment
requested/approved, salary proposal recommended/approved/rejected). Find wherever the frontend maps
a notification type to an icon/label/click-destination (likely a lookup object in the notifications
feature) and add entries for each new type, linking each to the relevant new page built in Phases
F03/F05/F06/F07/F08 (e.g. a promotion-approved notification should deep-link to that promotion's
detail view or the employee's promotion history).
```

**Acceptance criteria:** triggering each of the 6 new notification-producing actions (built in
earlier phases) results in a correctly-labeled, correctly-linked notification in the existing
notification UI, not a fallback "generic notification" rendering.

---

## Stop and report

After Prompt 13.2, report Prompt 13.1's finding specifically (endpoint exists vs. fallback chosen)
and confirm all 6 new notification types render with a real label/icon, not a generic fallback.

## Phase F13 exit criteria

- The contact picker (or its fallback) correctly reflects the backend's widened hierarchy-reach
  rule.
- All 6 new notification types render correctly, not as an unlabeled fallback.
