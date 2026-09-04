import { useMemo } from "react";
import { useAuth } from "../../core/auth";
import { BACKEND_ROLES, normalizeRoleName } from "../constants";
import { employeeNavigation } from "../../employee/navigation/employeeNavigation";
import { salesManagerNavigation } from "../../sales-manager/navigation/salesManagerNavigation";
import { superAdminNavigation } from "../../super-admin/navigation/superAdminNavigation";
import InternalAppLayout from "./InternalAppLayout";

export default function RoleAwareInternalLayout() {
  const { role } = useAuth();
  const normalizedRole = normalizeRoleName(role);

  const layoutConfig = useMemo(() => {
    if (
      normalizedRole === BACKEND_ROLES.SUPER_ADMIN ||
      normalizedRole === BACKEND_ROLES.SA ||
      normalizedRole === BACKEND_ROLES.OA
    ) {
      return {
        navigationItems: superAdminNavigation,
        portalLabel: "Super Admin Portal",
      };
    }

    if (
      normalizedRole === BACKEND_ROLES.SALES_MANAGER ||
      normalizedRole === BACKEND_ROLES.GM ||
      normalizedRole === BACKEND_ROLES.RM ||
      normalizedRole === BACKEND_ROLES.ASM ||
      normalizedRole === BACKEND_ROLES.SO
    ) {
      return {
        navigationItems: salesManagerNavigation,
        portalLabel: "Sales Manager Portal",
      };
    }

    return {
      navigationItems: employeeNavigation,
      portalLabel: "Employee Portal",
    };
  }, [normalizedRole]);

  return <InternalAppLayout {...layoutConfig} />;
}

