import { apiClient } from './apiClient';
import { UserProfile, EducationalResource, NotificationItem, ReportPayload } from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post<{ user: UserProfile; token: string }>('/auth/login', { email, password });
  },

  register: async (data: { fullName: string; email: string; password: string; phone?: string }) => {
    return apiClient.post<{ user: UserProfile; token: string }>('/auth/register', data);
  },

  forgotPassword: async (email: string) => {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  getMe: async () => {
    return apiClient.get<UserProfile>('/auth/me');
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    return apiClient.put<UserProfile>('/auth/profile', data);
  },
};

export const resourcesApi = {
  getAll: async (params?: { category?: string; search?: string }) => {
    return apiClient.get<EducationalResource[]>('/resources', params);
  },

  getById: async (id: string) => {
    return apiClient.get<EducationalResource>(`/resources/${id}`);
  },
};

export const reportsApi = {
  submit: async (report: ReportPayload) => {
    return apiClient.post<{ id: string; status: string }>('/reports', report);
  },
};

export const notificationsApi = {
  getAll: async () => {
    return apiClient.get<NotificationItem[]>('/notifications');
  },

  markAllRead: async () => {
    return apiClient.put<{ success: boolean }>('/notifications/read-all');
  },
};
