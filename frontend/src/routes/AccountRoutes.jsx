import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTES } from "../shared/constants";

const ChangePasswordPage = lazy(() => import("../auth/pages/ChangePasswordPage"));
const RoleAwareInternalLayout = lazy(() => import("../shared/layouts/RoleAwareInternalLayout"));

export const accountRouteConfig = {
  element: <ProtectedRoute />,
  children: [
    {
      element: <RoleAwareInternalLayout />,
      children: [{ path: ROUTES.AUTH.CHANGE_PASSWORD, element: <ChangePasswordPage /> }],
    },
  ],
};
