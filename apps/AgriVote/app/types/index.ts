export type Domain = 'crop' | 'soil' | 'irrigation' | 'pest' | 'disease' | 'fertilizer' | 'machinery' | 'subsidy';

export type UserRole = 'farmer' | 'expert' | 'moderator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserCreate {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface TokenResponse {
  access_token?: string;
  token_type?: string;
}

export interface QuestionCreate {
  text: string;
  metadata?: object;
}

export interface AnswerCreate {
  answer_text: string;
  images?: string[];
}

export type QuestionStatus = 'pending_allocation' | 'allocated' | 'in_review' | 'ready_for_moderator' | 'approved' | 'rejected' | 'reallocated';

export interface Question {
  id: string;
  farmerId: string;
  farmerName: string;
  originalQuestion: string;
  cleanedQuestion: string;
  aiSuggestions: string[];
  domain: Domain;
  status: QuestionStatus;
  submittedAt: string;
  isDuplicate?: boolean;
  duplicateOf?: string;
  allocatedExperts: string[];
  answers: Answer[];
  moderatorReview?: ModeratorReview;
  rejectionHistory?: RejectionHistory[];
}

export interface Answer {
  id: string;
  expertId: string;
  expertName: string;
  questionId: string;
  content: string;
  aiDraft?: string;
  aiQualitySuggestions: string[];
  votes: number;
  votedBy: string[];
  aiQualityScore: number;
  submittedAt: string;
  lastModifiedAt: string;
  requestedModeratorReview: boolean;
}

export interface ModeratorReview {
  moderatorId: string;
  moderatorName: string;
  decision: 'approved' | 'rejected';
  feedback: string;
  reviewedAt: string;
  selectedAnswerId?: string;
}

export interface RejectionHistory {
  attempt: number;
  expertIds: string[];
  reason: string;
  rejectedAt: string;
  aiContext: string;
}

export interface Expert {
  id: string;
  name: string;
  specialization: Domain[];
  accuracyScore: number;
  moderatorAcceptanceRate: number;
  peerVotesReceived: number;
  consistencyScore: number;
  averageResponseTime: number;
  totalAnswers: number;
  totalApprovals: number;
}

export interface DuplicateMatch {
  questionId: string;
  question: string;
  answer: string;
  similarity: number;
  domain: Domain;
  answeredAt: string;
}
