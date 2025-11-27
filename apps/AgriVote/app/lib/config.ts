// API Configuration
// Set VITE_API_BASE_URL environment variable to override the default localhost URL
// For development: VITE_API_BASE_URL=http://localhost:8001
// For production: VITE_API_BASE_URL=https://api.agri-vote.com
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

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
  HEALTH: `${API_BASE_URL}/health`,
} as const;
