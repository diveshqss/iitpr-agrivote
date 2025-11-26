import { Question, Expert, Domain } from '../types';

// Mock Expert Data
export const experts: Expert[] = [
  {
    id: 'expert-1',
    name: 'Dr. Rajesh Kumar',
    specialization: ['crop', 'soil', 'fertilizer'],
    accuracyScore: 94,
    moderatorAcceptanceRate: 92,
    peerVotesReceived: 156,
    consistencyScore: 89,
    averageResponseTime: 4.2,
    totalAnswers: 89,
    totalApprovals: 82
  },
  {
    id: 'expert-2',
    name: 'Dr. Priya Sharma',
    specialization: ['pest', 'disease'],
    accuracyScore: 91,
    moderatorAcceptanceRate: 88,
    peerVotesReceived: 134,
    consistencyScore: 92,
    averageResponseTime: 3.8,
    totalAnswers: 76,
    totalApprovals: 67
  },
  {
    id: 'expert-3',
    name: 'Prof. Anil Verma',
    specialization: ['irrigation', 'machinery', 'soil'],
    accuracyScore: 96,
    moderatorAcceptanceRate: 95,
    peerVotesReceived: 187,
    consistencyScore: 94,
    averageResponseTime: 5.1,
    totalAnswers: 102,
    totalApprovals: 97
  },
  {
    id: 'expert-4',
    name: 'Dr. Meera Patel',
    specialization: ['subsidy', 'crop', 'fertilizer'],
    accuracyScore: 88,
    moderatorAcceptanceRate: 85,
    peerVotesReceived: 98,
    consistencyScore: 87,
    averageResponseTime: 6.3,
    totalAnswers: 54,
    totalApprovals: 46
  },
  {
    id: 'expert-5',
    name: 'Dr. Vikram Singh',
    specialization: ['disease', 'pest', 'crop'],
    accuracyScore: 93,
    moderatorAcceptanceRate: 91,
    peerVotesReceived: 145,
    consistencyScore: 90,
    averageResponseTime: 4.7,
    totalAnswers: 81,
    totalApprovals: 74
  }
];

// Mock Questions Database
export let questions: Question[] = [
  {
    id: 'q-1',
    farmerId: 'farmer-001',
    farmerName: 'Ramesh Yadav',
    originalQuestion: 'my wheat crop is turning yellow what to do urgent help needed',
    cleanedQuestion: 'My wheat crop leaves are turning yellow. What could be the cause and what immediate action should I take?',
    aiSuggestions: [
      'Missing information: Location/region, crop age, irrigation schedule',
      'Consider asking about: Recent fertilizer application, weather conditions',
      'Clarity: Specify which part of the plant is yellowing (lower leaves, tips, entire plant)'
    ],
    domain: 'disease',
    status: 'approved',
    submittedAt: '2025-11-20T09:30:00Z',
    allocatedExperts: ['expert-2', 'expert-5', 'expert-1'],
    answers: [
      {
        id: 'a-1-1',
        expertId: 'expert-2',
        expertName: 'Dr. Priya Sharma',
        questionId: 'q-1',
        content: 'Yellowing of wheat leaves is typically caused by nitrogen deficiency or root rot. Check soil moisture - if overwatered, reduce irrigation immediately. Apply nitrogen fertilizer (urea) at 50kg/hectare. If yellowing starts from leaf tips, it may be fungal (rust). Spray Propiconazole fungicide. Monitor for 5-7 days.',
        aiQualitySuggestions: [
          'Good coverage of common causes',
          'Specific actionable recommendations provided',
          'Consider adding: Signs to differentiate between causes'
        ],
        votes: 6,
        votedBy: ['expert-5', 'expert-1', 'expert-3', 'expert-4', 'moderator-1'],
        aiQualityScore: 92,
        submittedAt: '2025-11-20T11:15:00Z',
        lastModifiedAt: '2025-11-20T11:45:00Z',
        requestedModeratorReview: true
      },
      {
        id: 'a-1-2',
        expertId: 'expert-5',
        expertName: 'Dr. Vikram Singh',
        questionId: 'q-1',
        content: 'Yellow wheat indicates nitrogen shortage. Apply 40-50 kg urea per hectare. Also check for rust disease - look for orange pustules. If found, use Mancozeb spray.',
        aiQualitySuggestions: [
          'Concise and actionable',
          'Consider adding: Dosage for fungicide, preventive measures'
        ],
        votes: 3,
        votedBy: ['expert-2', 'expert-1', 'expert-3'],
        aiQualityScore: 78,
        submittedAt: '2025-11-20T12:00:00Z',
        lastModifiedAt: '2025-11-20T12:00:00Z',
        requestedModeratorReview: false
      }
    ],
    moderatorReview: {
      moderatorId: 'moderator-1',
      moderatorName: 'Dr. Suresh Reddy',
      decision: 'approved',
      feedback: 'Comprehensive answer covering multiple possibilities with specific actions. Approved.',
      reviewedAt: '2025-11-20T14:30:00Z',
      selectedAnswerId: 'a-1-1'
    }
  }
];

export const domainColors: Record<Domain, { bg: string; text: string; border: string }> = {
  crop: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  soil: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  irrigation: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  pest: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  disease: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  fertilizer: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  machinery: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  subsidy: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' }
};

export function getExpertById(id: string): Expert | undefined {
  return experts.find(e => e.id === id);
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find(q => q.id === id);
}

export function updateQuestion(id: string, updates: Partial<Question>) {
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...updates };
  }
}

export function addQuestion(question: Question) {
  questions.push(question);
}

export function generateQuestionId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAnswerId(): string {
  return `a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
