import api from 'utils/api';

export const getMyProfile = async () => api.get('/api/users/me/profile');
export const getUserProfile = async (id) => api.get(`/api/users/${id}/profile`);
export const updateMyProfile = async (payload) => api.put('/api/users/me/profile', payload);
export const changeMyPassword = async (payload) => api.patch('/api/users/me/password', payload);
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
