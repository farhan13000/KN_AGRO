import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../../auth";
import { ALL_PERMISSIONS, ROUTES } from "../../shared/constants";
import { clearAccessToken } from "../api";
import { getPortalRouteForRole } from "./authRoutes";
import { subscribeToSessionExpired } from "./sessionEvents";

const privatePathPrefixes = ["/super-admin", "/manager", "/employee", ROUTES.AUTH.CHANGE_PASSWORD];

export const AuthContext = createContext(null);

const getUserPermissions = (user) => user?.role?.permissions || [];
const getUserRole = (user) => user?.role?.name || "";

const isPrivatePath = (pathname) =>
  privatePathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    initializing: true,
    authenticated: false,
    user: null,
    role: "",
    permissions: [],
    error: "",
  });

  const setAuthenticatedUser = useCallback((user) => {
    setState({
      initializing: false,
      authenticated: Boolean(user),
      user,
      role: getUserRole(user),
      permissions: getUserPermissions(user),
      error: "",
    });
  }, []);

  const clearSession = useCallback((error = "") => {
    clearAccessToken();
    setState({
      initializing: false,
      authenticated: false,
      user: null,
      role: "",
      permissions: [],
      error,
    });
  }, []);

  const restoreSession = useCallback(async () => {
    setState((current) => ({ ...current, initializing: true, error: "" }));

    try {
      await authApi.refreshSession();
      const currentUser = await authApi.getCurrentUser();
      setAuthenticatedUser(currentUser);
      return currentUser;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, setAuthenticatedUser]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    return subscribeToSessionExpired(() => {
      clearSession("Your session has expired. Please log in again.");

      if (isPrivatePath(window.location.pathname)) {
        window.location.assign(ROUTES.AUTH.LOGIN);
      }
    });
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      await authApi.login(credentials);
      const currentUser = await authApi.getCurrentUser();
      setAuthenticatedUser(currentUser);

      return {
        user: currentUser,
        redirectTo: getPortalRouteForRole(getUserRole(currentUser)),
      };
    },
    [setAuthenticatedUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const hasPermission = useCallback(
    (permission) => {
      if (!permission) return true;
      if (state.permissions.includes(ALL_PERMISSIONS)) return true;
      return state.permissions.includes(permission);
    },
    [state.permissions],
  );

  const value = useMemo(
    () => ({
      ...state,
      clearSession,
      hasPermission,
      login,
      logout,
      restoreSession,
    }),
    [clearSession, hasPermission, login, logout, restoreSession, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

