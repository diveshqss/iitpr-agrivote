import { API_ENDPOINTS } from './config';
import { UserCreate, TokenResponse, QuestionCreate, Question } from '../types';

// API Helper function to make HTTP requests
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${error}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  signup: async (userData: UserCreate): Promise<any> => {
    return apiRequest(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (username: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Login failed: ${response.status} ${response.statusText} - ${error}`);
    }

    return response.json();
  },

  getAuthHeaders: (token?: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },
};

// Farmer API
export const farmerAPI = {
  submitQuestion: async (questionData: QuestionCreate, token?: string): Promise<any> => {
    const headers = {
      ... authAPI.getAuthHeaders(token),
      'Content-Type': 'application/json',
    };

    return apiRequest(API_ENDPOINTS.FARMER.QUESTIONS, {
      method: 'POST',
      headers,
      body: JSON.stringify(questionData),
    });
  },

  getQuestion: async (questionId: string, token?: string): Promise<Question> => {
    const headers = authAPI.getAuthHeaders(token);

    return apiRequest(API_ENDPOINTS.FARMER.QUESTION_BY_ID(questionId), {
      method: 'GET',
      headers,
    });
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<any> => {
    return apiRequest(API_ENDPOINTS.HEALTH, {
      method: 'GET',
    });
  },
};

// Token management utilities
export const tokenUtils = {
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  removeToken: (): void => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    const token = tokenUtils.getToken();
    return token !== null && token !== '';
  },
};
