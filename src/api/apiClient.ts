/**
 * API Client Gateway for CommunityConnect
 */

import { ApiGatewayResponse } from '../types';

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  useMockFallback?: boolean;
}

function extractErrorMessage(value: unknown, fallback = 'API Gateway Connection Error'): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (value instanceof Error && value.message) return value.message;

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;

    for (const key of ['message', 'error_description', 'details', 'hint']) {
      const candidate = record[key];
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
    }

    if ('error' in record) {
      const nestedMessage = extractErrorMessage(record.error, '');
      if (nestedMessage) return nestedMessage;
    }

    try {
      const serialized = JSON.stringify(value);
      if (serialized && serialized !== '{}') return serialized;
    } catch {
      // Ignore serialization failures and use the safe fallback below.
    }
  }

  return fallback;
}

export class ApiGatewayClient {
  private baseUrl: string;
  private token: string | null = null;
  private logs: { timestamp: string; method: string; endpoint: string; status: number; payload?: unknown }[] = [];

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
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

  private logApiCall(method: string, endpoint: string, status: number, payload?: unknown) {
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
    const { params, useMockFallback: _useMockFallback = false, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
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

    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const method = options.method || 'GET';

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      let payload: unknown = null;

      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        const text = await response.text();
        payload = text || null;
      }

      if (!response.ok) {
        const payloadRecord = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
        const errorValue = payloadRecord?.error ?? payloadRecord?.message ?? payload;
        const errMessage = extractErrorMessage(
          errorValue,
          `HTTP ${response.status}: ${response.statusText || 'Request failed'}`,
        );

        this.logApiCall(method, endpoint, response.status, { error: errMessage, payload });
        throw new Error(errMessage);
      }

      this.logApiCall(method, endpoint, response.status, payload);
      return payload as ApiGatewayResponse<T>;
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      this.logApiCall(method, endpoint, 500, { error: message });
      return {
        success: false,
        error: message,
      };
    }
  }

  public async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiGatewayResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params: params as Record<string, string | number | boolean | undefined> });
  }

  public async post<T>(endpoint: string, body?: unknown): Promise<ApiGatewayResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  public async put<T>(endpoint: string, body?: unknown): Promise<ApiGatewayResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiGatewayResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiGatewayClient();
