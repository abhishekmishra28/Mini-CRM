import api from './api';

export const campaignsApi = {
  getAll: () => api.get('/campaigns').then(res => res.data.data),
  create: (data: any) => api.post('/campaigns', data).then(res => res.data.data),
  send: (id: string) => api.post(`/campaigns/${id}/send`).then(res => res.data.data),
  delete: (id: string) => api.delete(`/campaigns/${id}`).then(res => res.data.data),
  getCommunications: (id: string) => api.get(`/campaigns/${id}/communications`).then(res => res.data.data),
};
