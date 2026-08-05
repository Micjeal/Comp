import { apiClient } from './apiClient';
import { Event, CampaignCategory } from '../types';

export const eventsApi = {
  // GET /api/v1/events
  getAll: async (params?: { category?: CampaignCategory; search?: string }) => {
    return apiClient.get<Event[]>('/events', params);
  },

  // GET /api/v1/events/:id
  getById: async (id: string) => {
    return apiClient.get<Event>(`/events/${id}`);
  },

  // POST /api/v1/events
  create: async (data: {
    title: string;
    description: string;
    category: CampaignCategory;
    venue: string;
    isOnline: boolean;
    startTime: string;
    endTime: string;
    capacity?: number;
    groupId?: string;
    campaignId?: string;
  }) => {
    return apiClient.post<Event>('/events', data);
  },

  // POST /api/v1/events/:id/register
  register: async (id: string, attendeeInfo?: { fullName?: string; email?: string; phone?: string }) => {
    return apiClient.post<{ isRegistered: boolean; registeredCount: number }>(`/events/${id}/register`, attendeeInfo);
  },

  // PUT /api/v1/events/:id
  update: async (id: string, data: Partial<Event>) => {
    return apiClient.put<Event>(`/events/${id}`, data);
  },

  // DELETE /api/v1/events/:id
  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/events/${id}`);
  },
};
