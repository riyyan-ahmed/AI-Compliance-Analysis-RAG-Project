import axios from 'axios';
import { DocumentSummary, GapAnalysisResult, User } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({ baseURL: `${BASE_URL}/api` });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/login', { username, password });
    return res.data.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  me: async (): Promise<{ userId: string; username: string }> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};

export const documentsApi = {
  list: async (): Promise<DocumentSummary[]> => {
    const res = await api.get('/documents');
    return res.data.data;
  },
  get: async (id: string): Promise<DocumentSummary> => {
    const res = await api.get(`/documents/${id}`);
    return res.data.data;
  },
  upload: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<DocumentSummary> => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/documents/upload', form, {
      onUploadProgress: e =>
        onProgress?.(Math.round(((e.loaded ?? 0) / (e.total ?? 1)) * 100)),
    });
    return res.data.data;
  },
  analyze: async (id: string): Promise<void> => {
    await api.post(`/documents/${id}/analyze`);
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};

export const analysisApi = {
  gapAnalysis: async (docAId: string, docBId: string): Promise<GapAnalysisResult> => {
    const res = await api.post('/analysis/gap', { docAId, docBId });
    return res.data.data;
  },
};

// Returns the full URL for the streaming Q&A endpoint
export function getQAStreamURL(docId: string): string {
  return `${BASE_URL}/api/analysis/${docId}/qa`;
}
