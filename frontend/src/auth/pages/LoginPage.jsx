import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/KN_AGRO_LOGO.png";
import { useAuth } from "../../core/auth";
import { getPortalRouteForRole } from "../../core/auth";
import { ROUTES } from "../../shared/constants";

const initialForm = {
  email: "",
  password: "",
};

const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { authenticated, initializing, login, role } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isBusy = initializing || submitting;

  useEffect(() => {
    if (authenticated && role) {
      navigate(getPortalRouteForRole(role), { replace: true });
    }
  }, [authenticated, navigate, role]);

  const passwordInputType = useMemo(() => (showPassword ? "text" : "password"), [showPassword]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setApiError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateLoginForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setApiError("");

    try {
      const result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate(result.redirectTo, { replace: true });
    } catch (error) {
      setApiError(error?.friendlyMessage || error?.message || "Unable to log in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="relative hidden overflow-hidden bg-field-radial px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <Link className="inline-flex items-center gap-3" to={ROUTES.PUBLIC.HOME}>
            <img alt="K N Agro" className="h-14 w-14 rounded bg-white object-contain p-2" src={logo} />
            <span className="text-lg font-bold">K N Agro</span>
          </Link>

          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint">Business Portal</p>
            <h1 className="mt-4 text-5xl font-black leading-tight">
              Secure access for operations teams.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85">
              Manage role-based workflows from one protected workspace while the public website remains
              available for customers and enquiries.
            </p>
          </div>

          <p className="text-sm text-white/70">Authentication is verified by the K N Agro backend.</p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Link className="mb-8 inline-flex items-center gap-3 lg:hidden" to={ROUTES.PUBLIC.HOME}>
              <img alt="K N Agro" className="h-12 w-12 rounded bg-white object-contain p-2 shadow-card" src={logo} />
              <span className="text-lg font-black text-forest">K N Agro</span>
            </Link>

            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-forest/10 sm:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-agriculture">
                  Sign in
                </p>
                <h2 className="mt-2 text-3xl font-black text-ink">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Use your authorized account to continue to the management portal.
                </p>
              </div>

              <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
                <div>
                  <label className="form-label" htmlFor="login-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" />
                    <input
                      autoComplete="email"
                      className="form-field pl-11"
                      disabled={isBusy}
                      id="login-email"
                      inputMode="email"
                      name="email"
                      onChange={updateField("email")}
                      type="email"
                      value={form.email}
                    />
                  </div>
                  {errors.email ? <p className="form-error">{errors.email}</p> : null}
                </div>

                <div>
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" />
                    <input
                      autoComplete="current-password"
                      className="form-field pl-11 pr-12"
                      disabled={isBusy}
                      id="login-password"
                      name="password"
                      onChange={updateField("password")}
                      type={passwordInputType}
                      value={form.password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-soft transition hover:bg-mint hover:text-forest"
                      disabled={isBusy}
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password ? <p className="form-error">{errors.password}</p> : null}
                </div>

                {apiError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                    {apiError}
                  </div>
                ) : null}

                <button
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-agriculture disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isBusy}
                  type="submit"
                >
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
