import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../core/auth";
import { normalizeRoleName, ROUTES } from "../shared/constants";
import RouteLoader from "./RouteLoader";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const { authenticated, initializing, role } = useAuth();

  if (initializing) {
    return <RouteLoader message="Checking your session..." />;
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

