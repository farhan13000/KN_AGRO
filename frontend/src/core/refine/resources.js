import { PERMISSIONS, ROUTES } from "../../shared/constants";

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
  {
    name: "categories",
    list: ROUTES.SUPER_ADMIN.CATEGORIES,
    create: ROUTES.SUPER_ADMIN.CATEGORY_CREATE,
    edit: ROUTES.SUPER_ADMIN.CATEGORY_EDIT,
    meta: {
      domain: "catalog",
      permissions: {
        list: PERMISSIONS.CATEGORIES_READ,
        create: PERMISSIONS.CATEGORIES_MANAGE,
        edit: PERMISSIONS.CATEGORIES_MANAGE,
      },
      specialActions: ["changeStatus"],
    },
  },
  {
    name: "products",
    list: ROUTES.SUPER_ADMIN.PRODUCTS,
    show: ROUTES.SUPER_ADMIN.PRODUCT_DETAIL,
    create: ROUTES.SUPER_ADMIN.PRODUCT_CREATE,
    edit: ROUTES.SUPER_ADMIN.PRODUCT_EDIT,
    meta: {
      domain: "catalog",
      permissions: {
        list: PERMISSIONS.PRODUCTS_READ,
        show: PERMISSIONS.PRODUCTS_READ,
        create: PERMISSIONS.PRODUCTS_CREATE,
        edit: PERMISSIONS.PRODUCTS_UPDATE,
      },
      specialActions: ["changeStatus"],
    },
  },
  {
    name: "leads",
    list: ROUTES.SUPER_ADMIN.LEADS,
    show: ROUTES.SUPER_ADMIN.LEAD_DETAIL,
    create: ROUTES.SUPER_ADMIN.LEAD_CREATE,
    meta: {
      domain: "crm",
      permissions: {
        list: PERMISSIONS.LEADS_READ,
        show: PERMISSIONS.LEADS_READ,
        create: PERMISSIONS.LEADS_CREATE,
      },
      specialActions: [
        "assignManager",
        "assignEmployee",
        "changeStatus",
        "changePriority",
        "updateExpectedValue",
        "updateProductInterest",
        "scheduleFollowUp",
        "completeFollowUp",
        "markLost",
        "closeLead",
        "logActivity",
      ],
    },
  },
  {
    name: "inventory",
    list: ROUTES.SUPER_ADMIN.INVENTORY,
    show: ROUTES.SUPER_ADMIN.INVENTORY_DETAIL,
    meta: {
      domain: "inventory",
      permissions: {
        list: PERMISSIONS.INVENTORY_READ,
        show: PERMISSIONS.INVENTORY_READ,
      },
      specialActions: [
        "openingStock",
        "stockIn",
        "stockOut",
        "adjustmentIn",
        "adjustmentOut",
        "damagedStock",
      ],
    },
  },
  {
    name: "inventory-transactions",
    list: ROUTES.SUPER_ADMIN.INVENTORY_TRANSACTIONS,
    meta: {
      domain: "inventory",
      immutableLedger: true,
      permissions: {
        list: PERMISSIONS.INVENTORY_TRANSACTIONS_READ,
      },
    },
  },
];
