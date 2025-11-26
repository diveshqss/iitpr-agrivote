// API Configuration
// Set VITE_API_BASE_URL environment variable to override the default localhost URL
// For development: VITE_API_BASE_URL=http://localhost:8000
// For production: VITE_API_BASE_URL=https://api.agri-vote.com
export const API_BASE_URL = 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  SUBMIT_QUESTION: `${API_BASE_URL}/api/farmer/questions`,
  GET_QUESTION: (questionId: string) => `${API_BASE_URL}/api/farmer/questions/${questionId}`,
} as const;
