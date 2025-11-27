import { API_ENDPOINTS } from './config';
import { UserCreate, TokenResponse, QuestionCreate, Question, AnswerCreate, Question as QuestionResponse, Answer, PeerReview } from '../types';

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

    const apiResponse = await response.json();

    // Since backend returns { status, message, data: { access_token, token_type } }
    // We need to extract the token from data property
    if (apiResponse.status === 'success' && apiResponse.data) {
      return apiResponse.data; // { access_token, token_type }
    }

    throw new Error('Invalid response format from server');
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


// Expert API response types
interface SuccessResponse<T = any> {
  status: string;
  message: string;
  data: T;
}

// Helper function to get authorization headers
const getAuthHeaders = (): Record<string, string> => {
  const token = tokenUtils.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Expert API
export const expertAPI = {
  getExpertByEmail: async (email: string): Promise<SuccessResponse<{ expert: any }>> => {
    return apiRequest(API_ENDPOINTS.EXPERT.BY_EMAIL(email), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getAssignedQuestions: async (): Promise<SuccessResponse<{ questions: any[] }>> => {
    return apiRequest(API_ENDPOINTS.EXPERT.ASSIGNED_QUESTIONS, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  submitAnswer: async (questionId: string, answerData: AnswerCreate): Promise<any> => {
    return apiRequest(API_ENDPOINTS.EXPERT.SUBMIT_ANSWER(questionId), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(answerData),
    });
  },

  getQuestionAnswers: async (questionId: string): Promise<{ answers: Answer[] }> => {
    const response = await apiRequest(API_ENDPOINTS.EXPERT.QUESTION_ANSWERS(questionId), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },

  voteOnAnswer: async (answerId: string, voteType: string): Promise<any> => {
    return apiRequest(API_ENDPOINTS.EXPERT.VOTE_ANSWER(answerId), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ vote_type: voteType }),
    });
  },

  modifyAnswer: async (answerId: string, answerText: string): Promise<any> => {
    return apiRequest(API_ENDPOINTS.EXPERT.MODIFY_ANSWER(answerId), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answer_text: answerText }),
    });
  },

  requestModerator: async (questionId: string): Promise<any> => {
    return apiRequest(API_ENDPOINTS.EXPERT.REQUEST_MODERATOR(questionId), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  getNotifications: async (): Promise<{ notifications: any[] }> => {
    const response = await apiRequest(API_ENDPOINTS.EXPERT.NOTIFICATIONS, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },

  getAISuggestions: async (answerId: string): Promise<{ suggestions: string[] }> => {
    const response = await apiRequest(API_ENDPOINTS.EXPERT.AI_SUGGESTIONS(answerId), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response;
  },

  submitPeerReview: async (answerId: string, reviewData: { best_answer_vote: boolean; comment_text: string }): Promise<any> => {
    return apiRequest(API_ENDPOINTS.EXPERT.PEER_REVIEW(answerId), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
  },

  getPeerReviews: async (answerId: string): Promise<{ reviews: PeerReview[] }> => {
    const response = await apiRequest(API_ENDPOINTS.EXPERT.GET_PEER_REVIEWS(answerId), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },

  getBestAnswerVote: async (questionId: string): Promise<{ vote: { has_voted: boolean; answer_id?: string } }> => {
    const response = await apiRequest(API_ENDPOINTS.EXPERT.BEST_ANSWER_VOTE(questionId), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
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
