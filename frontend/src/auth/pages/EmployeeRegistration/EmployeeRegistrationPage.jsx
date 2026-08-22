import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/KN_AGRO_LOGO.png";
import { ROUTES } from "../../../shared/constants";
import {
  RegistrationPreferenceFields,
  pickRegistrationPayload,
  updateNestedValue,
  useEmployeeActions,
  validateRegistrationForm,
} from "../../../features/employees";

const initialValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
  requestedDepartment: "",
  requestedDesignation: "",
};

export default function EmployeeRegistrationPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const actions = useEmployeeActions();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => updateNestedValue(current, name, value));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateRegistrationForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) return;

    const response = await actions.registerEmployee.mutate(pickRegistrationPayload(values));
    navigate(ROUTES.AUTH.REGISTRATION_PENDING, {
      replace: true,
      state: {
        employeeCode: response?.employeeCode,
        status: response?.status,
      },
    });
  };

  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10">
        <Link className="mb-8 inline-flex items-center gap-3" to={ROUTES.PUBLIC.HOME}>
          <img alt="K N Agro" className="h-12 w-12 rounded bg-white object-contain p-2 shadow-card" src={logo} />
          <span className="text-lg font-black text-forest">K N Agro</span>
        </Link>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-lg bg-field-radial p-6 text-white shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint">Employee Registration</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">Apply for portal access</h1>
            <p className="mt-4 text-sm leading-6 text-white/82">
              Registration creates a pending account and employee application. Super Admin approval is required before portal access is active.
            </p>
          </section>

          <section className="rounded-lg bg-white p-6 shadow-card ring-1 ring-forest/10 sm:p-8">
            <form className="space-y-5" noValidate onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="registration-name">
                    Name <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" />
                    <input
                      className="form-field pl-11"
                      id="registration-name"
                      name="name"
                      onChange={handleChange}
                      type="text"
                      value={values.name}
                    />
                  </div>
                  {errors.name ? <p className="form-error">{errors.name}</p> : null}
                </div>
                <div>
                  <label className="form-label" htmlFor="registration-email">
                    Email <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" />
                    <input
                      className="form-field pl-11"
                      id="registration-email"
                      name="email"
                      onChange={handleChange}
                      type="email"
                      value={values.email}
                    />
                  </div>
                  {errors.email ? <p className="form-error">{errors.email}</p> : null}
                </div>
                <div>
                  <label className="form-label" htmlFor="registration-password">
                    Password <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" />
                    <input
                      className="form-field pl-11 pr-12"
                      id="registration-password"
                      name="password"
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-soft transition hover:bg-mint hover:text-forest"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password ? <p className="form-error">{errors.password}</p> : null}
                </div>
                <div>
                  <label className="form-label" htmlFor="registration-phone">
                    Phone <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" />
                    <input
                      className="form-field pl-11"
                      id="registration-phone"
                      name="phone"
                      onChange={handleChange}
                      type="tel"
                      value={values.phone}
                    />
                  </div>
                  {errors.phone ? <p className="form-error">{errors.phone}</p> : null}
                </div>
              </div>

              <RegistrationPreferenceFields errors={errors} onChange={handleChange} values={values} />

              {actions.registerEmployee.isError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                  {actions.registerEmployee.errorMessage}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link className="text-sm font-bold text-forest hover:text-agriculture" to={ROUTES.AUTH.LOGIN}>
                  Already approved? Sign in
                </Link>
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-forest px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
                  disabled={actions.registerEmployee.isLoading}
                  type="submit"
                >
                  {actions.registerEmployee.isLoading ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
