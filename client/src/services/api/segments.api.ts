import api from './api';

export const segmentsApi = {
  getAll: () => api.get('/segments').then(res => res.data.data),
  create: (data: any) => api.post('/segments', data).then(res => res.data.data),
  delete: (id: string) => api.delete(`/segments/${id}`).then(res => res.data.data),
  getCustomers: (id: string) => api.get(`/segments/${id}/customers`).then(res => res.data.data),
  preview: (data: any) => api.post('/segments/preview', data).then(res => res.data.data),
};
