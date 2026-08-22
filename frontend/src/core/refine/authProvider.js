import { authApi } from "../../auth";
import { ROUTES } from "../../shared/constants";
import { clearAccessToken } from "../api";
import { getPortalRouteForRole } from "../auth";

const getRoleName = (user) => user?.role?.name || "";

export const authProvider = {
  async login({ email, password }) {
    try {
      await authApi.login({ email, password });
      const user = await authApi.getCurrentUser();

      return {
        success: true,
        redirectTo: getPortalRouteForRole(getRoleName(user)),
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      clearAccessToken();
    }

    return {
      success: true,
      redirectTo: ROUTES.AUTH.LOGIN,
    };
  },

  async check() {
    try {
      await authApi.refreshSession();
      await authApi.getCurrentUser();

      return {
        authenticated: true,
      };
    } catch {
      return {
        authenticated: false,
        redirectTo: ROUTES.AUTH.LOGIN,
      };
    }
  },

  async getIdentity() {
    return authApi.getCurrentUser();
  },

  async onError(error) {
    if (error?.status === 401) {
      return {
        logout: true,
        redirectTo: ROUTES.AUTH.LOGIN,
      };
    }

    return {};
  },
};

