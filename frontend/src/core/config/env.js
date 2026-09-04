const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");
const viteEnv = import.meta.env || {};

export const env = Object.freeze({
  appName: viteEnv.VITE_APP_NAME || "KN Agro",
  apiBaseUrl: stripTrailingSlash(
    viteEnv.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  ),
  publicSiteUrl: stripTrailingSlash(
    viteEnv.VITE_PUBLIC_SITE_URL || globalThis.window?.location?.origin || "http://localhost:5173",
  ),
  businessTimezone: viteEnv.VITE_BUSINESS_TIMEZONE || "Asia/Kolkata",
});
