import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../core/auth";
import { normalizeRoleName, ROUTES } from "../shared/constants";
import RouteLoader from "./RouteLoader";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const { authenticated, connectionError, error, initializing, restoreSession, role } = useAuth();

  if (initializing) {
    return <RouteLoader message="Checking your session..." />;
  }

  // The session could not be checked (offline, timeout, server error) —
  // which is not the same as being signed out. Sending the user to the
  // login page here is what made a network blip look like a logout.
  if (connectionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
        <div className="max-w-md rounded-2xl border border-forest/10 bg-white p-6 text-center shadow-card">
          <h1 className="text-xl font-black text-ink">Cannot reach the server</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            You are still signed in. Check your internet connection and try again.
          </p>
          {error ? <p className="mt-2 text-xs text-muted">{error}</p> : null}
          <button
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-6 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-agriculture"
            onClick={() => restoreSession()}
            type="button"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate replace state={{ from: location }} to={ROUTES.AUTH.LOGIN} />;
  }

  if (allowedRoles.length > 0) {
    const normalizedRole = normalizeRoleName(role);
    const canAccessRole = allowedRoles.map(normalizeRoleName).includes(normalizedRole);

    if (!canAccessRole) {
      return <Navigate replace to={ROUTES.ERROR.UNAUTHORIZED} />;
    }
  }

  return <Outlet />;
}

