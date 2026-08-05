import { apiClient } from './apiClient';
import { Campaign, CampaignCategory, GoalType, CampaignUpdate } from '../types';

export const campaignsApi = {
  // GET /api/v1/campaigns
  getAll: async (params?: { category?: CampaignCategory; search?: string; status?: string }) => {
    return apiClient.get<Campaign[]>('/campaigns', params);
  },

  // GET /api/v1/campaigns/:id
  getById: async (id: string) => {
    return apiClient.get<Campaign>(`/campaigns/${id}`);
  },

  // POST /api/v1/campaigns
  create: async (data: {
    title: string;
    summary: string;
    description: string;
    category: CampaignCategory;
    coverUrl?: string;
    location: string;
    isOnline: boolean;
    goalType: GoalType;
    goalValue: number;
    unitLabel?: string;
    goalsList?: string[];
  }) => {
    return apiClient.post<Campaign>('/campaigns', data);
  },

  // POST /api/v1/campaigns/:id/join
  join: async (id: string) => {
    return apiClient.post<{ joined: boolean; currentValue: number }>(`/campaigns/${id}/join`);
  },

  // POST /api/v1/campaigns/:id/bookmark
  bookmark: async (id: string) => {
    return apiClient.post<{ bookmarked: boolean }>(`/campaigns/${id}/bookmark`);
  },

  // POST /api/v1/campaigns/:id/updates
  addUpdate: async (id: string, title: string, content: string) => {
    return apiClient.post<CampaignUpdate>(`/campaigns/${id}/updates`, { title, content });
  },

  // PUT /api/v1/campaigns/:id
  update: async (id: string, data: Partial<Campaign>) => {
    return apiClient.put<Campaign>(`/campaigns/${id}`, data);
  },

  // DELETE /api/v1/campaigns/:id
  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/campaigns/${id}`);
  },
};
