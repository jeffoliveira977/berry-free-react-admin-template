import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { getSession, login as loginRequest, logout } from 'services/authService';

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        // A sessão real fica nos cookies HttpOnly; o localStorage é apenas cache visual.
        const sessionUser = await getSession();
        if (mounted) {
          setUser(sessionUser);
          setIsAuth(true);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setIsAuth(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    const response = await loginRequest(email, password);
    const userData = {
      email: response.email,
      name: response.name,
      role: response.role,
      avatar: response.avatar || response.avatarUrl || response.photoUrl || response.profilePhoto || response.image || null
    };
    setUser(userData);
    setIsAuth(true);
    return userData;
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      setIsAuth(false);
    }
  }, []);

  const memoizedValue = useMemo(
    () => ({
      user,
      isAuthenticated: isAuth,
      loading,
      login: handleLogin,
      logout: handleLogout,
      setUser: (userData) => {
        setUser(userData);
        setIsAuth(Boolean(userData));
      }
    }),
    [user, isAuth, loading, handleLogin, handleLogout]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node
};
