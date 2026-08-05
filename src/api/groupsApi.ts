import { apiClient } from './apiClient';
import { Group, DiscussionPost, CampaignCategory } from '../types';

export const groupsApi = {
  // GET /api/v1/groups
  getAll: async (params?: { category?: CampaignCategory; search?: string }) => {
    return apiClient.get<Group[]>('/groups', params);
  },

  // GET /api/v1/groups/:id
  getById: async (id: string) => {
    return apiClient.get<Group>(`/groups/${id}`);
  },

  // POST /api/v1/groups
  create: async (data: {
    name: string;
    description: string;
    category: CampaignCategory;
    visibility: 'public' | 'private';
    location: string;
    coverUrl?: string;
    logoUrl?: string;
  }) => {
    return apiClient.post<Group>('/groups', data);
  },

  // POST /api/v1/groups/:id/join
  join: async (id: string) => {
    return apiClient.post<{ joined: boolean; membershipStatus: string }>(`/groups/${id}/join`);
  },

  // GET /api/v1/groups/:id/posts
  getPosts: async (groupId: string) => {
    return apiClient.get<DiscussionPost[]>(`/groups/${groupId}/posts`);
  },

  // POST /api/v1/groups/:id/posts
  createPost: async (groupId: string, data: { body: string; mediaUrl?: string; authorName?: string; authorAvatar?: string; authorRole?: string; authorId?: string }) => {
    return apiClient.post<DiscussionPost>(`/groups/${groupId}/posts`, data);
  },

  // GET /api/v1/posts/:id/comments
  getPostComments: async (postId: string) => {
    return apiClient.get<any[]>(`/posts/${postId}/comments`);
  },

  // POST /api/v1/posts/:id/comments
  addPostComment: async (postId: string, data: string | { body: string; authorName?: string; authorAvatar?: string }) => {
    const payload = typeof data === 'string' ? { body: data } : data;
    return apiClient.post<any>(`/posts/${postId}/comments`, payload);
  },

  // POST /api/v1/posts/:id/like
  likePost: async (postId: string) => {
    return apiClient.post<{ isLiked: boolean; likeCount: number }>(`/posts/${postId}/like`);
  },

  // PUT /api/v1/groups/:id
  update: async (id: string, data: Partial<Group>) => {
    return apiClient.put<Group>(`/groups/${id}`, data);
  },

  // DELETE /api/v1/groups/:id
  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/groups/${id}`);
  },

  // PUT /api/v1/posts/:id
  updatePost: async (postId: string, data: { body?: string; mediaUrl?: string }) => {
    return apiClient.put<DiscussionPost>(`/posts/${postId}`, data);
  },

  // DELETE /api/v1/posts/:id
  deletePost: async (postId: string) => {
    return apiClient.delete<{ success: boolean }>(`/posts/${postId}`);
  },

  // DELETE /api/v1/comments/:id
  deleteComment: async (commentId: string) => {
    return apiClient.delete<{ success: boolean }>(`/comments/${commentId}`);
  },
};
