import api from 'utils/api';

export const getNotifications = () => api.get('/api/notifications');

export const markNotificationAsRead = (id) => api.patch(`/api/notifications/${id}/read`, {});
