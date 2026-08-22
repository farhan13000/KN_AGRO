import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";
import { useAuth } from "../../core/auth";
import { useToast } from "../../shared/feedback/ToastContext";
import { ROUTES } from "../../shared/constants";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const validateForm = ({ currentPassword, newPassword, confirmPassword }) => {
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (!newPassword) {
    errors.newPassword = "New password is required.";
  } else if (newPassword.length < 8) {
    errors.newPassword = "New password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};

function PasswordField({ error, id, label, name, onChange, show, toggleShow, value }) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" />
        <input
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
          className="form-field pl-11 pr-12"
          id={id}
          name={name}
          onChange={onChange}
          type={show ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-soft transition hover:bg-mint hover:text-forest"
          onClick={toggleShow}
          type="button"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibleFields, setVisibleFields] = useState({});

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setApiError("");
  };

  const toggleShow = (field) => () => {
    setVisibleFields((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setApiError("");

    try {
      await authApi.changePassword(form);
      setForm(initialForm);
      showToast("Password changed successfully. Please log in again.");
      clearSession();
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (error) {
      setApiError(error?.friendlyMessage || error?.message || "Unable to change password right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-forest/10">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-agriculture">Account Security</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Change Password</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Changing your password ends the active session. You will need to sign in again.
        </p>
      </div>

      <form className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-forest/10" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-5">
          <PasswordField
            error={errors.currentPassword}
            id="current-password"
            label="Current Password"
            name="currentPassword"
            onChange={updateField("currentPassword")}
            show={Boolean(visibleFields.currentPassword)}
            toggleShow={toggleShow("currentPassword")}
            value={form.currentPassword}
          />
          <PasswordField
            error={errors.newPassword}
            id="new-password"
            label="New Password"
            name="newPassword"
            onChange={updateField("newPassword")}
            show={Boolean(visibleFields.newPassword)}
            toggleShow={toggleShow("newPassword")}
            value={form.newPassword}
          />
          <PasswordField
            error={errors.confirmPassword}
            id="confirm-password"
            label="Confirm New Password"
            name="confirmPassword"
            onChange={updateField("confirmPassword")}
            show={Boolean(visibleFields.confirmPassword)}
            toggleShow={toggleShow("confirmPassword")}
            value={form.confirmPassword}
          />
        </div>

        {apiError ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {apiError}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={() => navigate(-1)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-agriculture disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}

