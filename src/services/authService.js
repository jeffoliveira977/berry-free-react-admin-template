import api from 'utils/api';

/**
 * Fazer login com email e senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário autenticado
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password
    });

    // Salvar apenas dados do usuário para exibição
    const userData = {
      email: response.email,
      name: response.name,
      role: response.role
    };

    localStorage.setItem('user', JSON.stringify(userData));

    return response;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

/**
 * Fazer logout e limpar dados locais
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await api.post('/api/auth/logout', {});
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    // Limpar apenas os dados locais do usuário.
    localStorage.removeItem('user');
  }
};

/**
 * Renovar access token usando refresh token
 * @returns {Promise<Object>} Dados do usuário autenticado
 */
export const refreshToken = async () => {
  try {
    const response = await api.post('/api/auth/refresh', {});

    // Atualizar dados do usuário se fornecidos
    if (response.email) {
      const userData = {
        email: response.email,
        name: response.name,
        role: response.role
      };

      localStorage.setItem('user', JSON.stringify(userData));
    }

    return response;
  } catch (error) {
    console.error('Erro ao renovar token:', error);

    localStorage.removeItem('user');

    throw error;
  }
};

/**
 * Obter dados do usuário autenticado
 * @returns {Object|null} Dados do usuário ou null se não autenticado
 */
export const getUser = () => {
  const userJson = localStorage.getItem('user');

  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Verificar se o usuário está autenticado
 * @returns {boolean}

 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('user');
};
