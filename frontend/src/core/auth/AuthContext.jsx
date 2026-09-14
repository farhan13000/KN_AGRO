import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../../auth";
import { ALL_PERMISSIONS, ROUTES } from "../../shared/constants";
import { clearAccessToken, isSessionRejected } from "../api";
import { getPortalRouteForRole } from "./authRoutes";
import { subscribeToSessionExpired } from "./sessionEvents";

const privatePathPrefixes = ["/super-admin", "/manager", "/employee", ROUTES.AUTH.CHANGE_PASSWORD];

export const AuthContext = createContext(null);

const getUserPermissions = (user) => user?.role?.permissions || [];
const getUserRole = (user) => user?.role?.name || "";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    // True when the session could not be CHECKED — the server was
    // unreachable or failing — as opposed to checked and refused. The
    // routes show "retry" for this instead of sending the user to login.
    connectionError: false,
  });

  const setAuthenticatedUser = useCallback((user) => {
    setState({
      initializing: false,
      authenticated: Boolean(user),
      user,
      role: getUserRole(user),
      permissions: getUserPermissions(user),
      error: "",
      connectionError: false,
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
      connectionError: false,
    });
  }, []);

  /**
   * Called on every page load. Two outcomes used to be treated as one:
   *
   *  - the server REFUSED the session (401/403) -> genuinely signed out;
   *  - the session could not be checked at all (offline, timeout, 5xx)
   *    -> the login may be perfectly fine.
   *
   * The second used to log people out too, so a reload during a network
   * blip or a cold server start threw away a valid login. Now a transient
   * failure is retried a couple of times with a short back-off, and if it
   * still fails the app says it cannot reach the server and offers a
   * retry — the refresh cookie is left alone, so the retry just works.
   */
  const restoreSession = useCallback(async () => {
    setState((current) => ({ ...current, initializing: true, error: "", connectionError: false }));

    const attempts = [0, 800, 2000];
    let lastError = null;

    for (const delay of attempts) {
      if (delay) await wait(delay);
      try {
        await authApi.refreshSession();
        const currentUser = await authApi.getCurrentUser();
        setAuthenticatedUser(currentUser);
        return currentUser;
      } catch (error) {
        lastError = error;
        if (isSessionRejected(error)) {
          clearSession();
          return null;
        }
      }
    }

    // Never reached the server with an answer. Not signed out — unknown.
    clearAccessToken();
    setState({
      initializing: false,
      authenticated: false,
      user: null,
      role: "",
      permissions: [],
      error: lastError?.friendlyMessage || "Cannot reach the server right now.",
      connectionError: true,
    });
    return null;
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

