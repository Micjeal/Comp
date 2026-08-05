/**
 * API Client Gateway for CommunityConnect
 * Prepared for Node.js + Express backend connection
 */

import { ApiGatewayResponse } from '../types';

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  useMockFallback?: boolean;
}

export class ApiGatewayClient {
  private baseUrl: string;
  private token: string | null = null;
  private logs: { timestamp: string; method: string; endpoint: string; status: number; payload?: any }[] = [];

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
    // Retrieve auth token if present
    this.token = typeof window !== 'undefined' ? localStorage.getItem('cc_auth_token') : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('cc_auth_token', token);
      else localStorage.removeItem('cc_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getLogs() {
    return this.logs;
  }

  private logApiCall(method: string, endpoint: string, status: number, payload?: any) {
    this.logs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      status,
      payload,
    });
    if (this.logs.length > 50) this.logs.pop();
  }

  public async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiGatewayResponse<T>> {
    const { params, useMockFallback = true, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) searchParams.append(key, String(val));
      });
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const method = options.method || 'GET';

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        let errMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.error || errJson.message) errMessage = errJson.error || errJson.message;
        } catch (_) {}

        this.logApiCall(method, endpoint, response.status, { error: errMessage });
        throw new Error(errMessage);
      }

      const data = await response.json();
      this.logApiCall(method, endpoint, response.status, data);
      return data;
    } catch (error: any) {
      // If server route is not available or network fails, throw or fallback if requested
      this.logApiCall(method, endpoint, 500, { error: error.message, isFallbackMode: true });

      // Signal error to caller so mock/local state can step in seamlessly
      return {
        success: false,
        error: error.message || 'API Gateway Connection Error',
      };
    }
  }

  // Helper methods
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiGatewayResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  public async post<T>(endpoint: string, body?: any): Promise<ApiGatewayResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(endpoint: string, body?: any): Promise<ApiGatewayResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiGatewayResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiGatewayClient();
