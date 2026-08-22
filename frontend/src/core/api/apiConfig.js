import { env } from "../config";

export const API_CONFIG = Object.freeze({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
});

export const API_ENDPOINTS = Object.freeze({
  HEALTH: "/health",
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  EMPLOYEES: {
    BASE: "/employees",
    REGISTER: "/employees/register",
    ME: "/employees/me",
    MY_TEAM: "/employees/my-team",
    PENDING: "/employees/pending",
    HIERARCHY: "/employees/hierarchy",
    SUMMARY: "/employees/summary",
    DETAIL: (employeeId) => `/employees/${employeeId}`,
    MANAGER: (employeeId) => `/employees/${employeeId}/manager`,
    REPORTS: (employeeId) => `/employees/${employeeId}/reports`,
    DEACTIVATE: (employeeId) => `/employees/${employeeId}/deactivate`,
    RESIGN: (employeeId) => `/employees/${employeeId}/resign`,
    TERMINATE: (employeeId) => `/employees/${employeeId}/terminate`,
    REACTIVATE: (employeeId) => `/employees/${employeeId}/reactivate`,
    APPROVE: (employeeId) => `/employees/${employeeId}/approve`,
    REJECT: (employeeId) => `/employees/${employeeId}/reject`,
    PROMOTE: (employeeId) => `/employees/${employeeId}/promote`,
    PROMOTION_REQUEST: (employeeId) => `/employees/${employeeId}/promotion-request`,
  },
  EMPLOYEE_ACTION_REQUESTS: {
    BASE: "/employee-action-requests",
    APPROVE: (requestId) => `/employee-action-requests/${requestId}/approve`,
    REJECT: (requestId) => `/employee-action-requests/${requestId}/reject`,
  },
});
