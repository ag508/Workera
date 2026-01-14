const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private defaultTenantId: string = '11111111-1111-1111-1111-111111111111';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;

    // Add tenantId to params by default
    const queryParams = new URLSearchParams(params);
    if (!queryParams.has('tenantId')) {
      queryParams.append('tenantId', this.defaultTenantId);
    }

    const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;

    // Get token from localStorage if available (client-side only)
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('recruiter_token') || localStorage.getItem('accessToken') || '';
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...init.headers,
    };

    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `API Error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data || json; // Handle standard { success: true, data: ... } wrapper
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body: any, params?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      params
    });
  }

  put<T>(endpoint: string, body: any, params?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      params
    });
  }

  delete<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
