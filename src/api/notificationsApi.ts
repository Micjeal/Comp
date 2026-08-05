import { apiClient } from './apiClient';
import { NotificationItem } from '../types';

export const notificationsApi = {
  getAll: async () => {
    return apiClient.get<NotificationItem[]>('/notifications');
  },

  markAllRead: async () => {
    return apiClient.put<{ success: boolean }>('/notifications/read-all');
  },
};
