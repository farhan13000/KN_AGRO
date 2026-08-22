import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import logo from "../../../assets/KN_AGRO_LOGO.png";
import { ROUTES } from "../../../shared/constants";

export default function RegistrationPendingPage() {
  const location = useLocation();
  const employeeCode = location.state?.employeeCode;
  const status = location.state?.status;

  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-10">
        <Link className="mb-8 inline-flex items-center gap-3" to={ROUTES.PUBLIC.HOME}>
          <img alt="K N Agro" className="h-12 w-12 rounded bg-white object-contain p-2 shadow-card" src={logo} />
          <span className="text-lg font-black text-forest">K N Agro</span>
        </Link>

        <section className="rounded-lg bg-white p-6 text-center shadow-card ring-1 ring-forest/10 sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700 ring-1 ring-green-200">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-agriculture">
            Registration Submitted
          </p>
          <h1 className="mt-2 text-3xl font-black text-ink">Approval pending</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
            Your registration has been received. A Super Admin must review and approve it before your account can access the employee portal.
          </p>

          {employeeCode || status ? (
            <div className="mx-auto mt-6 grid max-w-md gap-3 rounded-lg bg-mint/70 p-4 text-left text-sm sm:grid-cols-2">
              {employeeCode ? (
                <div>
                  <p className="font-black text-forest">Employee Code</p>
                  <p className="mt-1 font-semibold text-ink">{employeeCode}</p>
                </div>
              ) : null}
              {status ? (
                <div>
                  <p className="font-black text-forest">Application Status</p>
                  <p className="mt-1 font-semibold text-ink">{status}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              to={ROUTES.PUBLIC.HOME}
            >
              Back to Website
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
              to={ROUTES.AUTH.LOGIN}
            >
              Go to Login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
