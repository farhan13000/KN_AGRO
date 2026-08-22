import { ROUTES } from "../../shared/constants";

export const refineResources = [
  {
    name: "employees",
    list: ROUTES.SUPER_ADMIN.EMPLOYEES,
    show: ROUTES.SUPER_ADMIN.EMPLOYEE_DETAIL,
    create: ROUTES.SUPER_ADMIN.EMPLOYEE_CREATE,
    edit: ROUTES.SUPER_ADMIN.EMPLOYEE_EDIT,
    meta: {
      domain: "employees",
      specialActions: [
        "approve",
        "reject",
        "assignManager",
        "deactivate",
        "reactivate",
        "resign",
        "terminate",
        "promote",
      ],
    },
  },
];
