import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api.js';

const AuthContext = createContext(null);

/**
 * Owns the authenticated session. On mount it validates any persisted token
 * against `/auth/me`, so expired or revoked sessions are discarded before
 * protected routes render.
 * @param {{children: import('react').ReactNode}} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const establishSession = useCallback(({ token, user: account }) => {
    tokenStore.set(token);
    setUser(account);
    return account;
  }, []);

  const login = useCallback(async (email, password) => establishSession(await api.login(email, password)), [establishSession]);
  const register = useCallback(
    async (name, email, password) => establishSession(await api.register(name, email, password)),
    [establishSession]
  );
  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @returns {{user: any, loading: boolean, isAdmin: boolean, login: Function, register: Function, logout: Function}} */
export const useAuth = () => useContext(AuthContext);
