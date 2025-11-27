// API Configuration
// Set VITE_API_BASE_URL environment variable to override the default localhost URL
// For development: VITE_API_BASE_URL=http://localhost:8000
// For production: VITE_API_BASE_URL=https://api.agri-vote.com
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
  },
  FARMER: {
    QUESTIONS: `${API_BASE_URL}/api/farmer/questions`,
    QUESTION_BY_ID: (questionId: string) => `${API_BASE_URL}/api/farmer/questions/${questionId}`,
  },
  EXPERT: {
    BY_EMAIL: (email: string) => `${API_BASE_URL}/api/expert/by-email/${email}`,
    ASSIGNED_QUESTIONS: `${API_BASE_URL}/api/expert/assigned-questions`,
    SUBMIT_ANSWER: (questionId: string) => `${API_BASE_URL}/api/expert/answer/submit/${questionId}`,
    QUESTION_ANSWERS: (questionId: string) => `${API_BASE_URL}/api/expert/question/${questionId}/answers`,
    VOTE_ANSWER: (answerId: string) => `${API_BASE_URL}/api/expert/answer/${answerId}/vote`,
    MODIFY_ANSWER: (answerId: string) => `${API_BASE_URL}/api/expert/answer/${answerId}/modify`,
    REQUEST_MODERATOR: (questionId: string) => `${API_BASE_URL}/api/expert/question/${questionId}/request-moderator`,
    NOTIFICATIONS: `${API_BASE_URL}/api/expert/notifications`,
    AI_SUGGESTIONS: (answerId: string) => `${API_BASE_URL}/api/expert/answer/${answerId}/ai-suggestions`,
  },
  HEALTH: `${API_BASE_URL}/health`,
} as const;
