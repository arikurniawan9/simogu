export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('simogu_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(options.headers as Record<string, string>),
        ...options,
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal terhubung ke server SIMOGU API.',
        },
      };
    }
  }

  async post<T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(options.headers as Record<string, string>),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal mengirim data ke server SIMOGU API.',
        },
      };
    }
  }

  async patch<T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: this.getHeaders(options.headers as Record<string, string>),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal memperbarui data di server SIMOGU API.',
        },
      };
    }
  }

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: this.getHeaders(options.headers as Record<string, string>),
        ...options,
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal menghapus data di server SIMOGU API.',
        },
      };
    }
  }
}

export const apiClient = new ApiClient();
