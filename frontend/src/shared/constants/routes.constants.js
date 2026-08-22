export const ROUTES = Object.freeze({
  PUBLIC: {
    HOME: "/",
    ABOUT: "/about",
    PRODUCTS: "/products",
    PRODUCT_DETAILS: "/products/:slug",
    CATEGORIES: "/categories",
    CATEGORY_DETAILS: "/categories/:slug",
    CONTACT: "/contact",
    ENQUIRY: "/enquiry",
    PRIVACY_POLICY: "/privacy-policy",
    TERMS: "/terms",
  },
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    REGISTRATION_PENDING: "/registration-pending",
    CHANGE_PASSWORD: "/change-password",
  },
  SUPER_ADMIN: {
    DASHBOARD: "/super-admin/dashboard",
    EMPLOYEES: "/super-admin/employees",
    EMPLOYEE_PENDING: "/super-admin/employees/pending",
    EMPLOYEE_HIERARCHY: "/super-admin/employees/hierarchy",
    EMPLOYEE_CREATE: "/super-admin/employees/create",
    EMPLOYEE_DETAIL: "/super-admin/employees/:employeeId",
    EMPLOYEE_EDIT: "/super-admin/employees/:employeeId/edit",
  },
  SALES_MANAGER: {
    DASHBOARD: "/manager/dashboard",
    TEAM: "/manager/team",
    TEAM_MEMBER_DETAIL: "/manager/team/:employeeId",
  },
  EMPLOYEE: {
    DASHBOARD: "/employee/dashboard",
    PROFILE: "/employee/profile",
    PROFILE_EDIT: "/employee/profile/edit",
  },
  ERROR: {
    UNAUTHORIZED: "/unauthorized",
    NOT_FOUND: "*",
  },
});
