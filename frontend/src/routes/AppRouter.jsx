import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import SkeletonCard from "../shared/components/SkeletonCard";
import { ROUTES } from "../shared/constants";
import { accountRouteConfig } from "./AccountRoutes";
import { employeeRouteConfig } from "./EmployeeRoutes";
import { publicRouteConfig } from "./PublicRoutes";
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

export const router = createBrowserRouter(
  [
    { path: ROUTES.AUTH.LOGIN, element: <LoginPage /> },
    { path: ROUTES.ERROR.UNAUTHORIZED, element: <UnauthorizedPage /> },
    accountRouteConfig,
    superAdminRouteConfig,
    salesManagerRouteConfig,
    employeeRouteConfig,
    publicRouteConfig,
  ].map(withSuspense),
);
