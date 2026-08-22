const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const env = Object.freeze({
  appName: import.meta.env.VITE_APP_NAME || "KN Agro",
  apiBaseUrl: stripTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  ),
  publicSiteUrl: stripTrailingSlash(
    import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin,
  ),
  useAuthMock: import.meta.env.DEV && import.meta.env.VITE_USE_AUTH_MOCK === "true",
  useEmployeeMock: import.meta.env.DEV && import.meta.env.VITE_USE_EMPLOYEE_MOCK === "true",
  salesManagerRoleId: import.meta.env.VITE_SALES_MANAGER_ROLE_ID || "",
});
