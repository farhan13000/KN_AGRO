# Frontend Migration Phase 20 — Communication (Conversations & Messages) UI

**Depends on:** Backend Phase 15 (`conversations`/`messages` modules — already built, verified,
live). Frontend Phase F13 (Notifications — already built; this phase is what its own Prompt 13.1
found couldn't be built yet, since there was nothing to extend, and reported as a dedicated gap for
its own phase). **Type:** wholly new — zero conversation/message UI exists anywhere in this
frontend.

**Read first — this is not a small extension, it's a real feature build:** Phase F13's own
investigation (see `frontend-phase-13-communication-ui.md`'s "IMPLEMENTED AND VERIFIED" section)
already did the hard discovery work here — re-read it before starting instead of re-deriving from
scratch:

- `POST /conversations/direct` (gated `MESSAGES_SEND`) starts (or returns the existing) direct
  conversation with a target user, enforcing `conversationScope.js#canStartConversation` — SA/OA
  are reachable by and can reach anyone unconditionally; every other pair is allowed only if one is
  an ancestor of the other anywhere in the real hierarchy chain (not just adjacent tiers — an FO
  reaching their GM directly is legitimate). **There is no separate "who can I message" list
  endpoint** — the confirmed, intended pattern is attempt-and-let-the-backend's-403-render, not a
  pre-filtered picker.
- `GET /conversations` (list mine), `GET /conversations/:id` (detail), `GET
  /conversations/unread-count`, `POST /conversations/:id/read` (mark read) — all gated
  `MESSAGES_READ`.
- `GET /conversations/:id/messages` (list), `POST /conversations/:id/messages` (send, gated
  `MESSAGES_SEND`, rate-limited via `messageSendRateLimiter` — a real 429 here needs the same
  "render the backend's actual message, don't swallow it" treatment as every other error case, not
  a generic "something went wrong").
- `MESSAGES_READ`/`MESSAGES_SEND` are held by every seeded role with an Employee record, plus OA
  (added specifically in Phase 15 so OA can reach/be reached by everyone, confirmed in
  `seedRoles.js`'s own comment) — this is genuinely universal, build it once, wire it into all
  three portals.

---

## Prompt 20.1 — Conversations & Messages API layer

```
Add `CONVERSATIONS` (and nested message paths) to `apiConfig.js` — exact paths above, verify
directly against `BACKEND/backend/src/modules/conversations/conversation.routes.js` and
`.../messages/message.routes.js` before wiring anything (they may have changed since Phase F13's
own investigation). Create `src/features/conversations/services/conversationApi.js` — 
startDirectConversation(targetUserId), listConversations(query), getConversation(id),
getUnreadCount(), markRead(id), listMessages(conversationId, query),
sendMessage(conversationId, text). Check `conversation.serializer.js`/`message.serializer.js`
directly for the exact response shapes (participant info, message sender/body/createdAt) — don't
guess.
```

**Acceptance criteria:** API functions exist and match the backend's actual routes/permissions.

---

## Prompt 20.2 — Contact picker: attempt-and-reject, not pre-filtered

```
Build a "New Conversation" entry point (a button opening a simple picker) that lets the user pick
ANY other active user in the system — reuse whatever broad employee/user search the app already
has (check `features/employees`'s own list-fetching hooks for a searchable-by-name pattern rather
than building a new one) — and calls `startDirectConversation`. Do NOT attempt to pre-filter the
picker to "who I'm allowed to message" — per Phase F13's own confirmed finding, there is no backend
endpoint for that, and re-implementing `isSubordinate`/ancestor-chain logic client-side is exactly
the business-rule duplication this whole migration has avoided everywhere else. If the backend
rejects the attempt (403, "you may only message someone in your own management chain" or similar),
render that message inline in the picker — don't crash, don't show a generic error.
```

**Acceptance criteria:** starting a conversation with someone in the caller's real ancestor chain
succeeds; attempting one with an unrelated peer (two people under different managers, no
ancestor/descendant relationship) shows the backend's real rejection message inline, confirmed
against a real pair via the browser, not assumed from the picker being disabled.

---

## Prompt 20.3 — Conversation list + message thread

```
Build `ConversationListView.jsx` (`GET /conversations`, unread-count badge per conversation) and
`ConversationThreadView.jsx` (`GET /conversations/:id/messages`, a simple message composer calling
`POST /conversations/:id/messages`) as one shared feature-level pair of components — reuse the same
portal-wrapper-page pattern every other shared feature in this plan uses (thin
`SuperAdminXPage.jsx`/`SalesManagerXPage.jsx`/`EmployeeXPage.jsx` wrappers around one shared view,
not three divergent implementations). Opening a conversation should call `markRead` (matches the
existing Notification Bell's own "click marks it read" pattern from Phase F13, for consistency).
A message-send hitting the real rate limiter (429) must render that specific message, not a
generic failure — this is a genuinely reachable case (`messageSendRateLimiter`, tight in
production) worth testing directly, not assuming.
```

**Acceptance criteria:** a real message sends and appears in the thread; the conversation list's
unread badge updates correctly after reading; a rate-limited send shows the backend's specific 429
message.

---

## Prompt 20.4 — Wire into all three portals + the notification deep-link

```
Add the Conversations nav entry + routes to all three portals (Super Admin, Sales Manager,
Employee), gated `MESSAGES_READ`. Then close the loop Phase F13 left open: go back to
`src/features/notifications/utils/notificationDestination.js` and add a real route builder for the
`VIEW_CONVERSATION` actionKey (previously absent — Phase F13 explicitly listed it as a disclosed,
not-yet-buildable gap) so a `MESSAGE_RECEIVED` notification finally deep-links into the actual
conversation thread instead of rendering with no destination.
```

**Acceptance criteria:** all three portals can reach Conversations from their nav; a real
`MESSAGE_RECEIVED` notification (trigger one by sending a message to a role holding
`NOTIFICATIONS_READ`) now click-throughs directly into that conversation's thread.

---

## Stop and report

After Prompt 20.4, walk one real conversation end-to-end between two users in a real ancestor
relationship (e.g. an FO and their real GM, reaching across the full chain not just an adjacent
tier) — start it, send messages both directions, confirm the notification for the recipient
deep-links correctly, and confirm a third, unrelated user cannot start a conversation with either
of them.

## Phase F20 exit criteria

- Any user can attempt to message any other user; the backend's real ancestor-chain (or SA/OA
  unconditional) rule is what actually decides it, rendered inline when rejected — no client-side
  pre-filtering logic exists anywhere in this feature.
- Conversation list, thread view, and send are fully operable in all three portals.
- The `MESSAGE_RECEIVED` notification deep-link, left as a disclosed gap in Phase F13, now works.
