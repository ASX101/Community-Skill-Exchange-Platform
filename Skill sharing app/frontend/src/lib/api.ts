const API_URL = 'http://localhost:8000/api';
const CSRF_COOKIE_URL = 'http://localhost:8000/sanctum/csrf-cookie';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  error?: string;
}

// CSRF token
async function initializeCsrfToken(): Promise<void> {
  return Promise.resolve();
}

// Get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Set auth token
function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

// Clear auth token
function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

// Generic fetch with auth header
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  // Only set Content-Type if body is not FormData
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = isFormData 
    ? {} 
    : { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', 
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        errors: data.errors,
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    return {
      success: false,
      message: 'Network error',
      error: String(error),
    };
  }
}
// generic API client

export const apiClient = {
  get: async <T = any>(endpoint: string) => {
    return apiCall<T>(endpoint, { method: 'GET' });
  },

  post: async <T = any>(endpoint: string, body?: any) => {
    return apiCall<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  },
  put: async <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    if (body instanceof FormData) {
      body.append('_method', 'PUT');
      return apiCall<T>(endpoint, {
        method: 'POST',
        body: body,
        ...options,
      });
    }
    return apiCall<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },
  // put: async <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
  //   return apiCall<T>(endpoint, {
  //     method: 'PUT',
  //     body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
  //     ...options,
  //   });
  // },

  delete: async <T = any>(endpoint: string) => {
    return apiCall<T>(endpoint, { method: 'DELETE' });
  },
};

// auth

export const authAPI = {
  register: async (name: string, email: string, password: string, role: string) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation: password, role }),
    });
  },

  login: async (email: string, password: string) => {
    const response = await apiCall<{ user?: any; token?: string; unverified?: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  logout: async () => {
    clearAuthToken();
    return apiCall('/auth/logout', { method: 'POST' });
  },

  profile: async () => {
    return apiCall('/auth/profile');
  },
};

// skills

export const skillsAPI = {
  list: async (page = 1, category?: string) => {
    let url = `/skills?page=${page}`;
    if (category) url += `&category=${category}`;
    return apiCall(url);
  },

  search: async (query: string) => {
    return apiCall(`/skills/search?q=${encodeURIComponent(query)}`);
  },

  show: async (id: number) => {
    return apiCall(`/skills/${id}`);
  },

  create: async (data: any) => {
    return apiCall('/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any) => {
    return apiCall(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return apiCall(`/skills/${id}`, { method: 'DELETE' });
  },
};

// categories

export const categoriesAPI = {
  list: async () => {
    return apiCall('/categories');
  },
};

// users

export const usersAPI = {
  show: async (id: number) => {
    return apiCall(`/users/${id}`);
  },

  updateProfile: async (data: any) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// exchange

export const exchangesAPI = {
  create: async (skillId: number, notes: string) => {
    return apiCall('/exchanges', {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId, notes }),
    });
  },

  show: async (id: number) => {
    return apiCall(`/exchanges/${id}`);
  },

  accept: async (id: number) => {
    return apiCall(`/exchanges/${id}/accept`, { method: 'POST' });
  },

  complete: async (id: number) => {
    return apiCall(`/exchanges/${id}/complete`, { method: 'POST' });
  },

  cancel: async (id: number) => {
    return apiCall(`/exchanges/${id}/cancel`, { method: 'POST' });
  },

  myExchanges: async () => {
    return apiCall('/exchanges');
  },
};

// message

export const messagesAPI = {
  send: async (exchangeId: number, content: string) => {
    return apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify({ exchange_id: exchangeId, content }),
    });
  },

  getExchangeMessages: async (exchangeId: number) => {
    return apiCall(`/messages/exchange/${exchangeId}`);
  },

  markAsRead: async (messageId: number) => {
    return apiCall(`/messages/${messageId}/read`, { method: 'POST' });
  },

  getUnread: async () => {
    return apiCall('/messages/unread');
  },
};

// reviews

export const reviewsAPI = {
  create: async (exchangeId: number, skillId: number, rating: number, comment: string) => {
    return apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify({ exchange_id: exchangeId, skill_id: skillId, rating, comment }),
    });
  },

  skillReviews: async (skillId: number) => {
    return apiCall(`/reviews/skill/${skillId}`);
  },

  userReviews: async (userId: number) => {
    return apiCall(`/reviews/user/${userId}`);
  },
};

// ==================== BOOKMARKS ====================

export const bookmarksAPI = {
  add: async (skillId: number) => {
    return apiCall('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId }),
    });
  },

  remove: async (skillId: number) => {
    return apiCall(`/bookmarks/${skillId}`, { method: 'DELETE' });
  },

  list: async () => {
    return apiCall('/bookmarks');
  },

  check: async (skillId: number) => {
    return apiCall(`/bookmarks/check/${skillId}`);
  },
};

// ==================== PASSWORD RESET ====================

export const passwordResetAPI = {
  forgotPassword: async (email: string) => {
    return apiCall('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, email: string, password: string, passwordConfirmation: string) => {
    return apiCall('/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });
  },
};

// Export CSRF initialization for use in auth provider
export { initializeCsrfToken };
