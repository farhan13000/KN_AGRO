import { useState } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";
import Card from "../../../shared/components/Card";
import { PermissionGuard } from "../../../core/auth";
import { PERMISSIONS } from "../../../shared/constants";
import { describeLastLogin, describePassword, getEmployeeEmail } from "../utils";
import CopyableValue from "./CopyableValue";
import ResetPasswordDialog from "./ResetPasswordDialog";
import UserAccountStatusBadge from "./UserAccountStatusBadge";

/**
 * "Login details" for one employee — everything an admin needs to answer
 * "why can this person not sign in?", and the one action that fixes it.
 *
 * WHY THERE IS NO PASSWORD ON THIS CARD. A password is stored as a
 * bcrypt hash: the original text is destroyed at the moment the account
 * is created and cannot be recovered from the database, by this app or
 * by anyone who steals it. So the card says so in plain words rather
 * than leaving an admin hunting for a field that cannot exist. What it
 * shows instead is what actually troubleshoots a login:
 *
 *   - the login email, which IS the username here — copyable, because
 *     the usual cause is that the employee is typing a different one;
 *   - whether the account itself is allowed to sign in at all (a
 *     SUSPENDED/DISABLED account rejects a correct password, which
 *     looks identical to a wrong password from the employee's side);
 *   - whether they have ever managed to sign in;
 *   - whether they are still on the password they were handed, which is
 *     the one case where somebody else knows it too.
 */
export default function LoginAccessCard({ employee, onChanged }) {
  const [resetOpen, setResetOpen] = useState(false);
  const user = employee?.user;
  const email = getEmployeeEmail(employee);
  const lastLogin = describeLastLogin(user);
  const password = describePassword(user);

  const toneClass = (tone) => (tone === "warn" ? "text-amber-800" : "text-ink");

  return (
    <Card className="p-5" data-login-access>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-black text-ink">Login Details</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            What this employee signs in with, and whether they can.
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.USERS_RESET_PASSWORD}>
          {user?._id ? (
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              data-reset-password-open
              onClick={() => setResetOpen(true)}
              type="button"
            >
              <KeyRound className="h-4 w-4" />
              Reset Password
            </button>
          ) : null}
        </PermissionGuard>
      </div>

      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-black uppercase text-forest">Login Email</dt>
          <dd className="mt-1">
            {email ? <CopyableValue label="login email" value={email} /> : <span className="text-sm font-semibold text-ink">Not Available</span>}
          </dd>
          <p className="mt-1 text-xs leading-5 text-muted">This is the username — there is no separate one.</p>
        </div>

        <div>
          <dt className="text-xs font-black uppercase text-forest">Account</dt>
          <dd className="mt-1">
            <UserAccountStatusBadge status={user?.status} />
          </dd>
          <p className="mt-1 text-xs leading-5 text-muted">
            A suspended or disabled account refuses even the correct password.
          </p>
        </div>

        <div>
          <dt className="text-xs font-black uppercase text-forest">Last Signed In</dt>
          <dd className={`mt-1 text-sm font-semibold ${toneClass(lastLogin.tone)}`}>{lastLogin.text}</dd>
          {!user?.lastLoginAt ? (
            <p className="mt-1 text-xs leading-5 text-muted">
              Usually means the password never reached them. Reset it and send it again.
            </p>
          ) : null}
        </div>

        <div>
          <dt className="text-xs font-black uppercase text-forest">Password</dt>
          <dd className={`mt-1 text-sm font-semibold ${toneClass(password.tone)}`}>{password.text}</dd>
          {password.detail ? <p className="mt-1 text-xs leading-5 text-muted">{password.detail}</p> : null}
        </div>
      </dl>

      {/* Said once, here, rather than left as a gap an admin keeps
          looking for. */}
      <p className="mt-5 flex gap-2 rounded-lg border border-forest/10 bg-mint/30 px-3 py-3 text-xs leading-5 text-muted">
        <ShieldAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
        <span>
          Passwords are not stored and cannot be shown — not on this screen, not in the database, not to anyone. Only
          an encrypted form is kept, which cannot be turned back into the password. That is deliberate: if this screen
          could show it, so could anybody who got hold of the database. When an employee is locked out,{" "}
          <span className="font-bold text-ink">Reset Password</span> sets a new one and shows it to you once.
        </span>
      </p>

      <ResetPasswordDialog
        employee={employee}
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        onSuccess={onChanged}
      />
    </Card>
  );
}
