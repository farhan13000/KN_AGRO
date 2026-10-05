import { useEffect, useState } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import Modal from "../../../shared/components/Modal";
import { useEmployeeActions } from "../hooks";
import { getEmployeeDisplayName, getEmployeeEmail } from "../utils";
import CopyableValue from "./CopyableValue";

/**
 * Setting a new login password for an employee who cannot get in, and
 * showing it ONCE so it can be passed on.
 *
 * THE SHAPE OF THIS DIALOG IS THE POINT. It has two states, never both:
 *
 *   1. before — choose how the password is set, then confirm.
 *   2. after  — the password, large, copyable, with a plain warning that
 *               this is the only time it will ever be shown.
 *
 * There is no "show it again" button and no way back to state 2 once the
 * dialog closes, because the server does not keep the password either —
 * only its bcrypt hash. That is not a limitation to work around; a
 * password the system could re-display would be a password anyone
 * reading the database could re-display too.
 *
 * The generated option is offered first and selected by default. Left to
 * type their own, admins reuse one password across the whole office —
 * which is exactly the situation where one leaked password opens every
 * account.
 */
export default function ResetPasswordDialog({ employee, isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("generate");
  const [typedPassword, setTypedPassword] = useState("");
  const [result, setResult] = useState(null);

  const actions = useEmployeeActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });
  const mutation = actions.resetEmployeePassword;

  // Every open starts clean. Without this, reopening the dialog for a
  // DIFFERENT employee would show the previous person's password.
  useEffect(() => {
    if (isOpen) {
      setMode("generate");
      setTypedPassword("");
      setResult(null);
    }
  }, [isOpen, employee?._id]);

  const isTypedValid = mode === "generate" || typedPassword.trim().length >= 8;

  const handleConfirm = async () => {
    if (!employee?._id || !isTypedValid) return;
    const payload = mode === "generate" ? {} : { newPassword: typedPassword };
    const data = await mutation.mutate(employee._id, payload);
    setResult(data);
  };

  const name = getEmployeeDisplayName(employee);
  const email = getEmployeeEmail(employee);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={result ? "New password" : "Reset login password"}>
      {result ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted">
            <span className="font-black text-ink">{name}</span> can now sign in with this. They have been signed out
            everywhere else.
          </p>

          <div className="rounded-lg border border-forest/15 bg-mint/40 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Login email</p>
            <div className="mt-1">
              <CopyableValue label="login email" value={email} />
            </div>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-forest">Password</p>
            <div className="mt-1" data-reset-password-value>
              <CopyableValue label="password" mono size="large" value={result.password} />
            </div>
          </div>

          <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-semibold leading-6 text-amber-900">
            <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              This is the only time this password is shown. Send it to {name} now. Once you close this box nobody —
              not even you — can read it again, because only its encrypted form is stored. If it is lost, reset again.
            </span>
          </p>

          <div className="flex justify-end">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
              onClick={onClose}
              type="button"
            >
              I have shared it — Close
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted">
            This sets a new password for <span className="font-black text-ink">{name}</span> ({email}) and signs them
            out of every device. Their existing password cannot be shown — it is stored encrypted and cannot be read
            back — so setting a new one is the only way to get them in.
          </p>

          <fieldset className="space-y-3">
            <legend className="form-label">How should the password be set?</legend>

            <label className="flex cursor-pointer gap-3 rounded-lg border border-forest/15 bg-white p-3 transition hover:bg-mint/40">
              <input
                checked={mode === "generate"}
                className="mt-1 h-4 w-4 shrink-0 accent-forest"
                name="reset-password-mode"
                onChange={() => setMode("generate")}
                type="radio"
                value="generate"
              />
              <span>
                <span className="block text-sm font-black text-ink">Create one for me (recommended)</span>
                <span className="mt-1 block text-sm leading-6 text-muted">
                  Easy to read out on a call, and different for every employee — so one leaked password never opens a
                  second account.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer gap-3 rounded-lg border border-forest/15 bg-white p-3 transition hover:bg-mint/40">
              <input
                checked={mode === "manual"}
                className="mt-1 h-4 w-4 shrink-0 accent-forest"
                name="reset-password-mode"
                onChange={() => setMode("manual")}
                type="radio"
                value="manual"
              />
              <span>
                <span className="block text-sm font-black text-ink">I will type one</span>
                <span className="mt-1 block text-sm leading-6 text-muted">
                  At least 8 characters. Do not reuse the same one across employees.
                </span>
              </span>
            </label>
          </fieldset>

          {mode === "manual" ? (
            <div>
              <label className="form-label" htmlFor="reset-password-input">
                New password
              </label>
              <input
                autoComplete="new-password"
                className="form-field"
                id="reset-password-input"
                onChange={(event) => setTypedPassword(event.target.value)}
                type="text"
                value={typedPassword}
              />
              {typedPassword && !isTypedValid ? (
                <p className="mt-1 text-sm font-semibold text-red-700">Needs at least 8 characters.</p>
              ) : null}
            </div>
          ) : null}

          {mutation?.isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
              {mutation.errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
              data-reset-password-confirm
              disabled={mutation?.isLoading || !isTypedValid}
              onClick={handleConfirm}
              type="button"
            >
              <KeyRound className="h-4 w-4" />
              {mutation?.isLoading ? "Setting..." : "Set new password"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
