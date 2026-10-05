/**
 * Turning the two dates the server can honestly report about an account
 * into sentences an admin can act on.
 *
 * WHAT IS NOT HERE, and why: a password. Passwords are stored as bcrypt
 * hashes (one-way), so no screen in this app — or any correctly built
 * one — can display an employee's existing password. These helpers
 * describe the next best thing: whether the person can get in, when they
 * last did, and whether the password they hold is one somebody else also
 * knows.
 */

const formatDateTime = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * "Never signed in" is the single most useful thing on this screen: it
 * means the account was created and the person never got in — usually
 * because the password never reached them, which a reset fixes.
 */
export const describeLastLogin = (user) => {
  if (!user?.lastLoginAt) {
    return { text: "Never signed in", tone: "warn" };
  }
  return { text: formatDateTime(user.lastLoginAt), tone: "normal" };
};

/**
 * `passwordChangedAt === null` does not mean "no password" — it means the
 * password has never been changed since the account was made, i.e. the
 * employee is still using the one they were handed. That is worth saying
 * out loud on an admin screen, because it is the one case where somebody
 * other than the employee knows their password.
 */
export const describePassword = (user) => {
  if (!user?._id) {
    return { text: "No login account", short: "No account", tone: "warn", detail: "" };
  }
  if (!user.passwordChangedAt) {
    return {
      text: "Still the one they were given",
      // `short` is for the employee table, which already carries
      // thirteen columns — a full sentence there pushes the row off the
      // side. The card, where there is room to be clear, uses `text`.
      short: "Password not changed",
      tone: "warn",
      detail: "They have not set their own password yet, so whoever created the account also knows it.",
    };
  }
  return {
    text: `Changed by them on ${formatDateTime(user.passwordChangedAt)}`,
    short: "Own password",
    tone: "normal",
    detail: "Only the employee knows this password. It cannot be read back — a reset is the only way in.",
  };
};
