import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { getPortalRouteForRole, useAuth } from "../core/auth";
import { ROUTES } from "../shared/constants";

export default function UnauthorizedPage() {
  const { authenticated, role } = useAuth();
  const primaryRoute = authenticated ? getPortalRouteForRole(role) : ROUTES.AUTH.LOGIN;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-5 py-12">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-forest/10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-agriculture">403</p>
        <h1 className="mt-3 text-3xl font-black text-ink">You do not have access to this area.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Your account is active, but this route is outside your current portal permissions.
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-agriculture"
          to={primaryRoute}
        >
          {authenticated ? "Go to my dashboard" : "Go to login"}
        </Link>
      </section>
    </main>
  );
}

