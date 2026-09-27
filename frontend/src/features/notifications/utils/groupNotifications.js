/**
 * How many of the same kind it takes before a run of notifications is
 * worth collapsing. Two rows of "lead assigned" read fine; five is the
 * noise this whole change exists to remove.
 */
const GROUP_THRESHOLD = 3;

/**
 * Splits the panel's list into the two things a person actually wants to
 * know: what is waiting on them, and what merely happened.
 *
 * `isActionRequired` comes from the server (see the backend's
 * notification.modules.js) rather than being re-derived here, so the
 * panel and the sidebar badges can never disagree about what counts as
 * work.
 *
 * Only the activity half is grouped. An item awaiting your decision is
 * never folded into a count — each one is a separate thing to do, and
 * hiding four of them behind a "5" is how they get missed.
 */
/**
 * `recent` is the newest page of everything; `unread` is the newest page
 * of unread only. The action section is drawn from `unread` because a
 * decision that has been waiting days would otherwise be pushed out of
 * the recent page by ordinary chatter — exactly the item that must not
 * be hidden.
 *
 * UNREAD is half the definition of "needs your action": something you
 * have already opened is history, not a to-do. Keeping read items in
 * that section buries the real work and makes its count disagree with
 * the bell, which counts unread action-required only.
 */
export const splitNotifications = (recent, unread = []) => {
  const actionRequired = unread.filter((n) => n.isActionRequired);
  const actionIds = new Set(actionRequired.map((n) => n._id));

  const activity = recent.filter((n) => !actionIds.has(n._id));

  return { actionRequired, activity: groupByType(activity) };
};

/**
 * Returns entries in the order the newest member of each group appeared,
 * so collapsing never silently pushes a recent item below an older one.
 * Anything below the threshold stays an ordinary single row.
 */
const groupByType = (notifications) => {
  const byType = new Map();

  for (const notification of notifications) {
    const bucket = byType.get(notification.type);
    if (bucket) {
      bucket.push(notification);
    } else {
      byType.set(notification.type, [notification]);
    }
  }

  const entries = [];

  for (const [type, items] of byType) {
    if (items.length >= GROUP_THRESHOLD) {
      entries.push({
        kind: "group",
        key: `group:${type}`,
        type,
        items,
        // The list arrives newest-first, so the first member is the one
        // whose position the whole group should take.
        sortAt: items[0].createdAt,
        unreadCount: items.filter((item) => !item.isRead).length,
      });
      continue;
    }

    for (const item of items) {
      entries.push({ kind: "single", key: item._id, notification: item, sortAt: item.createdAt });
    }
  }

  return entries.sort((a, b) => new Date(b.sortAt) - new Date(a.sortAt));
};
