import { apiClient } from './apiClient';
import { ReportPayload } from '../types';

export const reportsApi = {
  submit: async (report: ReportPayload) => {
    return apiClient.post<{ id: string; status: string }>('/reports', report);
  },
};
