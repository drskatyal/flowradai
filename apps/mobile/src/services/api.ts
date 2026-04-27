import axios from 'axios';
import { useAppStore } from '../stores/appStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err.message),
);

// ─── Templates ────────────────────────────────────────────────────────────────
export const templateApi = {
  list: (search?: string) =>
    apiClient.get('/template/', { params: search ? { search } : undefined }),
  getById: (id: string) => apiClient.get(`/template/${id}`),
  create: (data: object) => apiClient.post('/template/', data),
  update: (id: string, data: object) => apiClient.put(`/template/${id}`, data),
  delete: (id: string) => apiClient.delete(`/template/${id}`),
  clone: (id: string) => apiClient.post('/template/clone', { templateId: id }),
};

// ─── Threads & Messages ───────────────────────────────────────────────────────
export const threadApi = {
  list: () => apiClient.get('/thread/'),
  create: () => apiClient.post('/thread/'),
  getById: (id: string) => apiClient.get(`/thread/${id}`),
  stats: () => apiClient.get('/thread/stats'),
  history: () => apiClient.get('/thread/history'),
  delete: (id: string) => apiClient.delete(`/thread/${id}`),
};

export const messageApi = {
  getByThread: (threadId: string) => apiClient.get(`/message/${threadId}`),
  create: (data: object) => apiClient.post('/message/', data),
};

// ─── Audio ────────────────────────────────────────────────────────────────────
export const audioApi = {
  transcribe: (formData: FormData) =>
    apiClient.post('/audio/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Macros ───────────────────────────────────────────────────────────────────
export const macroApi = {
  list: () => apiClient.get('/macro/getMacros'),
  create: (data: object) => apiClient.post('/macro/createOrUpdateMacro', data),
  delete: (id: string) => apiClient.delete('/macro/deleteMacro', { params: { id } }),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userApi = {
  ensure: (clerkId: string, email: string) =>
    apiClient.post('/users/ensure', { clerkId, email }),
  onboarding: (data: object) => apiClient.post('/users/onboarding', data),
  update: (id: string, data: object) => apiClient.put(`/users/${id}`, data),
};

// ─── Refine ───────────────────────────────────────────────────────────────────
export const refineApi = {
  refineFindingsText: (text: string) =>
    apiClient.post('/refine/findings-text/', { text }),
};
