import api from 'utils/api';

const toUserData = (response) => ({
  email: response.email,
  name: response.name,
  role: response.role,
  avatar: response.avatar || response.avatarUrl || response.photoUrl || response.profilePhoto || response.image || null
});

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('user', JSON.stringify(toUserData(response)));
  return response;
};

export const getSession = async () => {
  // Usa o access token atual; a camada HTTP só faz refresh se ele retornar 401.
  const response = await api.get('/api/auth/me');
  const userData = toUserData(response);
  localStorage.setItem('user', JSON.stringify(userData));
  return userData;
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout', {});
  } finally {
    localStorage.removeItem('user');
  }
};

export const refreshToken = async () => {
  const response = await api.post('/api/auth/refresh', {});
  const userData = toUserData(response);
  localStorage.setItem('user', JSON.stringify(userData));
  return response;
};

export const getUser = () => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

// Mantido por compatibilidade; a validade real é verificada pelo backend.
export const isAuthenticated = () => Boolean(getUser());
