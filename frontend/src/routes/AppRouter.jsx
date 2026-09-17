import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import SkeletonCard from "../shared/components/SkeletonCard";
import { ROUTES } from "../shared/constants";
import { accountRouteConfig } from "./AccountRoutes";
import { employeeRouteConfig } from "./EmployeeRoutes";
import { publicRouteConfig } from "./PublicRoutes";
import RootErrorBoundary from "./RootErrorBoundary";
import { salesManagerRouteConfig } from "./SalesManagerRoutes";
import { superAdminRouteConfig } from "./SuperAdminRoutes";

const LoginPage = lazy(() => import("../auth/pages/LoginPage"));
const UnauthorizedPage = lazy(() => import("./UnauthorizedPage"));

function PageFallback() {
  return (
    <div className="site-container py-16">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

const withSuspense = (route) => ({
  ...route,
  element: <Suspense fallback={<PageFallback />}>{route.element}</Suspense>,
  children: route.children?.map(withSuspense),
});

export const router = createBrowserRouter([
  {
    // Pathless layout route wrapping every real route below — URL
    // matching, params, and rendering for each child are unchanged; the
    // only thing this adds is errorElement, which React Router applies to
    // its whole subtree. Without this, each of the entries below was its
    // own independent root with no shared ancestor to attach one
    // errorElement to, so an unhandled error anywhere (a lazy chunk that
    // fails to fetch, or any other uncaught render error) fell through to
    // React Router's own default fallback — a raw, unstyled stack trace.
    element: <Outlet />,
    errorElement: <RootErrorBoundary />,
    children: [
      { path: ROUTES.AUTH.LOGIN, element: <LoginPage /> },
      { path: ROUTES.ERROR.UNAUTHORIZED, element: <UnauthorizedPage /> },
      accountRouteConfig,
      superAdminRouteConfig,
      salesManagerRouteConfig,
      employeeRouteConfig,
      publicRouteConfig,
    ].map(withSuspense),
  },
]);
