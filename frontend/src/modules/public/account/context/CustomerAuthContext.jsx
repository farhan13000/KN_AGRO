import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { accountApi } from "../api/accountApi";
import {
  clearCustomerAccessToken,
  refreshCustomerSession,
  setCustomerAccessToken,
  setCustomerSessionLostHandler,
} from "../api/accountClient";

const CustomerAuthContext = createContext(null);

/**
 * The signed-in website customer, kept entirely separate from the staff
 * AuthContext.
 *
 * The access token lives in memory only — never localStorage — exactly as
 * the staff session does. What survives a reload is the httpOnly refresh
 * cookie, which the mount effect below trades for a fresh access token.
 * `isReady` exists so the account pages can tell "not signed in" apart
 * from "we have not asked yet"; without it, a reload would bounce a
 * signed-in customer to the sign-in page for a moment.
 */
export function CustomerAuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const clearSession = useCallback(() => {
    clearCustomerAccessToken();
    setAccount(null);
  }, []);

  useEffect(() => {
    setCustomerSessionLostHandler(clearSession);
    return () => setCustomerSessionLostHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    // A failed refresh is the normal case for anyone who never signed in,
    // so it resolves to "no session" rather than surfacing an error.
    refreshCustomerSession()
      .then((result) => {
        if (cancelled) return;
        if (result?.account) setAccount(result.account);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const register = useCallback(async (payload) => {
    const data = await accountApi.register(payload);
    setCustomerAccessToken(data?.accessToken);
    setAccount(data?.account ?? null);
    return data?.account ?? null;
  }, []);

  const login = useCallback(async (identifier, password) => {
    const data = await accountApi.login(identifier, password);
    setCustomerAccessToken(data?.accessToken);
    setAccount(data?.account ?? null);
    return data?.account ?? null;
  }, []);

  const logout = useCallback(async () => {
    try {
      await accountApi.logout();
    } finally {
      // Whatever the server said, the local session is over.
      clearSession();
    }
  }, [clearSession]);

  const updateProfile = useCallback(async (payload) => {
    const data = await accountApi.updateProfile(payload);
    if (data?.account) setAccount(data.account);
    return data?.account ?? null;
  }, []);

  const value = useMemo(
    () => ({
      account,
      isSignedIn: Boolean(account),
      isReady,
      register,
      login,
      logout,
      updateProfile,
    }),
    [account, isReady, register, login, logout, updateProfile],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used inside a CustomerAuthProvider");
  }
  return context;
};

export default CustomerAuthContext;
