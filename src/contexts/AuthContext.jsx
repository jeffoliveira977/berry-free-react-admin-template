import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

// Serviços
import { getUser, isAuthenticated, logout } from 'services/authService';

// ==============================|| AUTH CONTEXT ||============================== //

export const AuthContext = createContext(undefined);

// ==============================|| AUTH PROVIDER ||============================== //

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Inicializar estado de autenticação ao carregar
  useEffect(() => {
    const user = getUser();
    const authenticated = isAuthenticated();

    setUser(user);
    setIsAuth(authenticated);
    setLoading(false);
  }, []);

  // Função para fazer logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      setIsAuth(false);
    }
  }, []);

  // Função para atualizar usuário após login
  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setIsAuth(true);
  }, []);

  const memoizedValue = useMemo(
    () => ({
      user,
      isAuthenticated: isAuth,
      loading,
      logout: handleLogout,
      setUser: handleLogin
    }),
    [user, isAuth, loading, handleLogout, handleLogin]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node
};
