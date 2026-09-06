import { useMemo } from "react";
import { getPortalLabelForRole, useAuth } from "../../core/auth";
import { BACKEND_ROLES, normalizeRoleName } from "../constants";
import { employeeNavigation } from "../../employee/navigation/employeeNavigation";
import { salesManagerNavigation } from "../../sales-manager/navigation/salesManagerNavigation";
import { superAdminNavigation } from "../../super-admin/navigation/superAdminNavigation";
import InternalAppLayout from "./InternalAppLayout";

/**
 * Which navigation and portal title a signed-in role gets.
 *
 * The three navigation sets are grouped by what a role actually needs to
 * see, not by role name — several roles legitimately share one. The
 * portal TITLE, though, is always the viewer's own role label, because a
 * fixed per-group title used to name roles that no longer exist: a GM
 * saw "Sales Manager Portal" and an FO saw "Employee Portal".
 */
export default function RoleAwareInternalLayout() {
  const { role } = useAuth();
  const normalizedRole = normalizeRoleName(role);

  const layoutConfig = useMemo(() => {
    if (normalizedRole === BACKEND_ROLES.SA || normalizedRole === BACKEND_ROLES.OA) {
      return {
        navigationItems: superAdminNavigation,
        portalLabel: getPortalLabelForRole(normalizedRole),
      };
    }

    if (
      normalizedRole === BACKEND_ROLES.GM ||
      normalizedRole === BACKEND_ROLES.RM ||
      normalizedRole === BACKEND_ROLES.ASM ||
      normalizedRole === BACKEND_ROLES.SO
    ) {
      return {
        navigationItems: salesManagerNavigation,
        portalLabel: getPortalLabelForRole(normalizedRole),
      };
    }

    return {
      navigationItems: employeeNavigation,
      portalLabel: getPortalLabelForRole(normalizedRole),
    };
  }, [normalizedRole]);

  return <InternalAppLayout {...layoutConfig} />;
}

