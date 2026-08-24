import { PERMISSIONS } from "../../../shared/constants/permissions.constants.js";
import { BACKEND_ROLES, normalizeRoleName } from "../../../shared/constants/roles.constants.js";
import { LEAD_STATUS } from "../constants/lead.constants.js";

const terminalStatuses = [LEAD_STATUS.CONVERTED, LEAD_STATUS.LOST, LEAD_STATUS.CLOSED];

export const getLeadCapabilities = ({ hasPermission, lead, role }) => {
  const normalizedRole = normalizeRoleName(role);
  const canUpdateLead = hasPermission(PERMISSIONS.LEADS_UPDATE);
  const canAssign = hasPermission(PERMISSIONS.LEADS_ASSIGN);
  const canChangeStatus = hasPermission(PERMISSIONS.LEADS_CHANGE_STATUS);
  const canScheduleFollowUp = hasPermission(PERMISSIONS.LEADS_FOLLOW_UP);

  return {
    canViewLead: hasPermission(PERMISSIONS.LEADS_READ),
    canCreateLead: hasPermission(PERMISSIONS.LEADS_CREATE),
    canEditLead: canUpdateLead,
    canAssignManager: canAssign && normalizedRole === BACKEND_ROLES.SUPER_ADMIN,
    canAssignEmployee:
      canAssign && [BACKEND_ROLES.SUPER_ADMIN, BACKEND_ROLES.SALES_MANAGER].includes(normalizedRole),
    canChangeStatus,
    canChangePriority: canUpdateLead,
    canUpdateExpectedValue: canUpdateLead,
    canUpdateProductInterest: canUpdateLead,
    canScheduleFollowUp,
    canCompleteFollowUp: canScheduleFollowUp,
    canAddActivity: hasPermission(PERMISSIONS.LEADS_ACTIVITIES_CREATE),
    canMarkLost:
      canChangeStatus &&
      ![LEAD_STATUS.CONVERTED, LEAD_STATUS.LOST, LEAD_STATUS.CLOSED].includes(lead?.status),
    canCloseLead: canChangeStatus && [LEAD_STATUS.CONVERTED, LEAD_STATUS.LOST].includes(lead?.status),
    canQualify: canChangeStatus && !terminalStatuses.includes(lead?.status) && lead?.status !== LEAD_STATUS.QUALIFIED,
  };
};
