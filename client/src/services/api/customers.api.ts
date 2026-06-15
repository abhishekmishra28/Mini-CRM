import api from './api';

export const customersApi = {
  getAll: () => api.get('/customers').then(res => res.data.data),
  getById: (id: string) => api.get(`/customers/${id}`).then(res => res.data.data),
  create: (data: any) => api.post('/customers', data).then(res => res.data.data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data).then(res => res.data.data),
  delete: (id: string) => api.delete(`/customers/${id}`).then(res => res.data.data),
  getOrders: (id: string) => api.get(`/customers/${id}/orders`).then(res => res.data.data),
};
