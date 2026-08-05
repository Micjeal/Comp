import { apiClient } from './apiClient';
import { EducationalResource } from '../types';

export const resourcesApi = {
  getAll: async (params?: { category?: string; search?: string }) => {
    return apiClient.get<EducationalResource[]>('/resources', params);
  },

  getById: async (id: string) => {
    return apiClient.get<EducationalResource>(`/resources/${id}`);
  },
};
