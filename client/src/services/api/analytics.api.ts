import api from './api';

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard').then(res => res.data.data),
};
