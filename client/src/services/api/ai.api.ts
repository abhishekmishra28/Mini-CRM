import api from './api';

export const aiApi = {
  chat: (prompt: string, context?: any) => api.post('/ai/chat', { prompt, context }).then(res => res.data.data),
  generateSegment: (prompt: string) => api.post('/ai/generate-segment', { prompt }).then(res => res.data.data),
  generateCampaign: (prompt: string, segments: any[]) => api.post('/ai/generate-campaign', { prompt, segments }).then(res => res.data.data),
  generateMessage: (prompt: string) => api.post('/ai/generate-message', { prompt }).then(res => res.data.data.response),
  getInsights: () => api.post('/ai/insights').then(res => res.data.data.response),
};
