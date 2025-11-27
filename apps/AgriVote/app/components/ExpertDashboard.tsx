import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, MessageSquare, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { Question, Expert } from '../types';
import { QuestionCard } from './QuestionCard';
import { AnswerSubmission } from './AnswerSubmission';
import { ReviewAnswers } from './ReviewAnswers';
import { expertAPI } from '../lib/api';
import { useAuth } from '../lib/auth-context';

interface ExpertDashboardProps {
  onBack: () => void;
}

export function ExpertDashboard({ onBack }: ExpertDashboardProps) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'assigned' | 'review'>('assigned');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expert, setExpert] = useState<Expert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpertData = async () => {
      if (!user || user.role !== 'expert') {
        setError('Please log in as an expert to access this dashboard');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch expert data from backend using the logged-in user's email
        const response = await expertAPI.getExpertByEmail(user.email);
        const expertData = response.data.expert;

        // Transform to match our Expert interface
        const transformedExpert: Expert = {
          id: expertData._id || expertData.id,
          name: expertData.name,
          specialization: [expertData.domain], // Convert single domain to array
          accuracyScore: expertData.accuracy || 85,
          moderatorAcceptanceRate: expertData.score || 4.5,
          peerVotesReceived: expertData.peerVotesReceived || 156,
          consistencyScore: expertData.consistencyScore || 88,
          averageResponseTime: expertData.averageResponseTime || 3.2,
          totalAnswers: expertData.totalAnswers || 42,
          totalApprovals: expertData.totalApprovals || 39
        };

        setExpert(transformedExpert);

        // Fetch questions using the expert's ID
        await fetchAssignedQuestions(transformedExpert.id);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load expert data');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAssignedQuestions = async (expertId: string) => {
      try {
        // Update expert ID in all API calls
        const response = await expertAPI.getAssignedQuestions();
        const apiQuestions: Question[] = (response.data?.questions || []).map((q: any) => {
          const mappedQuestion: Question = {
            id: q.id,
            farmerId: q.user_id || 'unknown',
            farmerName: 'Farmer',
            originalQuestion: q.original_text,
            cleanedQuestion: q.cleaned_text,
            aiSuggestions: [],
            domain: q.domain,
            status: (q.status === 'assigned' ? 'allocated' : q.status === 'answered' ? 'in_review' : 'allocated') as any,
            submittedAt: typeof q.created_at === 'object' && q.created_at.$date ? q.created_at.$date : q.created_at,
            allocatedExperts: q.assigned_experts || [],
            answers: [],
            isDuplicate: q.duplicate_of !== null,
            duplicateOf: q.duplicate_of,
            moderatorReview: undefined,
            rejectionHistory: undefined
          };
          return mappedQuestion;
        });

        // Load answers for questions that are available for review
        const questionsWithAnswers = await Promise.all(
          apiQuestions.map(async (question) => {
            if (question.status === 'in_review' && question.allocatedExperts.includes(expertId)) {
              try {
                const answersResponse = await expertAPI.getQuestionAnswers(question.id);
                const answers = answersResponse.answers.map((answer: any) => ({
                  id: answer._id || answer.id,
                  expertId: answer.expert_id,
                  expertName: answer.expert_name || 'Expert', // We'll enhance this later
                  questionId: answer.question_id,
                  content: answer.answer_text,
                  aiDraft: answer.ai_draft,
                  aiQualitySuggestions: answer.ai_quality_suggestions || [],
                  votes: answer.upvotes || 0,
                  votedBy: answer.voted_by || [],
                  aiQualityScore: answer.ai_quality_score || 85,
                  submittedAt: answer.created_at,
                  lastModifiedAt: answer.created_at,
                  requestedModeratorReview: answer.requestedModeratorReview || false,
                  peerVotes: answer.peer_votes || 0,
                  peerReviewComments: [] // We'll load these separately if needed
                }));
                return { ...question, answers };
              } catch (error) {
                console.error(`Failed to load answers for question ${question.id}:`, error);
                return question;
              }
            }
            return question;
          })
        );

        setQuestions(questionsWithAnswers);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError('Failed to load questions');
      }
    };

    fetchExpertData();
  }, [user, token]);

  // Function to refresh questions data after answer submission
  const refreshQuestionsData = async () => {
    if (expert) {
      const expertId = expert.id;
      try {
        const response = await expertAPI.getAssignedQuestions();
        const apiQuestions: Question[] = (response.data?.questions || []).map((q: any) => ({
          id: q.id,
          farmerId: q.user_id || 'unknown',
          farmerName: 'Farmer',
          originalQuestion: q.original_text,
          cleanedQuestion: q.cleaned_text,
          aiSuggestions: [],
          domain: q.domain,
          status: q.status === 'assigned' ? 'allocated' : q.status === 'answered' ? 'in_review' : 'allocated',
          submittedAt: typeof q.created_at === 'object' && q.created_at.$date ? q.created_at.$date : q.created_at,
          allocatedExperts: q.assigned_experts || [],
          answers: [],
          isDuplicate: q.duplicate_of !== null,
          duplicateOf: q.duplicate_of
        }));

        // Load answers for questions that are available for review
        const questionsWithAnswers = await Promise.all(
          apiQuestions.map(async (question) => {
            if (question.status === 'in_review' && question.allocatedExperts.includes(expertId)) {
              try {
                const answersResponse = await expertAPI.getQuestionAnswers(question.id);
                const answers = answersResponse.answers.map((answer: any) => ({
                  id: answer._id || answer.id,
                  expertId: answer.expert_id,
                  expertName: answer.expert_name || 'Expert',
                  questionId: answer.question_id,
                  content: answer.answer_text,
                  aiDraft: answer.ai_draft,
                  aiQualitySuggestions: answer.ai_quality_suggestions || [],
                  votes: answer.upvotes || 0,
                  votedBy: answer.voted_by || [],
                  aiQualityScore: answer.ai_quality_score || 85,
                  submittedAt: answer.created_at,
                  lastModifiedAt: answer.created_at,
                  requestedModeratorReview: answer.requestedModeratorReview || false,
                  peerVotes: answer.peer_votes || 0,
                  peerReviewComments: []
                }));
                return { ...question, answers };
              } catch (error) {
                console.error(`Failed to load answers for question ${question.id}:`, error);
                return question;
              }
            }
            return question;
          })
        );

        setQuestions(questionsWithAnswers);
      } catch (err) {
        console.error('Failed to refresh questions:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-blue-700">Loading expert dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Expert should not be null after successful loading
  if (!expert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">Failed to load expert profile</p>
        </div>
      </div>
    );
  }

  const assignedQuestions = questions.filter(q =>
    q.allocatedExperts.includes(expert.id) &&
    ['allocated', 'in_review'].includes(q.status)
  );

  const reviewQuestions = questions.filter(q =>
    q.allocatedExperts.includes(expert.id) &&
    q.answers.length > 0 &&
    q.status === 'in_review'
  );

  if (selectedQuestion) {
    const myAnswer = selectedQuestion.answers.find(a => a.expertId === expert.id);

    if (myAnswer) {
      return (
        <ReviewAnswers
          question={selectedQuestion}
          expertId={expert.id}
          onBack={() => setSelectedQuestion(null)}
          onUpdate={(updatedQuestion) => {
            setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
            setSelectedQuestion(updatedQuestion);
          }}
        />
      );
    } else {
      return (
        <AnswerSubmission
          question={selectedQuestion}
          expertId={expert.id}
          onBack={async () => {
            setSelectedQuestion(null);
            await refreshQuestionsData(); // Refresh questions after answer submission
          }}
          onSubmit={(updatedQuestion) => {
            setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
            setSelectedQuestion(null);
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Expert Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-blue-900 mb-2">Welcome, {expert.name}</h1>
              <p className="text-blue-700">Expert ID: {expert.id}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {expert.specialization.map((spec: string) => (
                  <span key={spec} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-green-600">{expert.accuracyScore}% Accuracy</span>
              </div>
              <p className="text-gray-600 text-sm">{expert.totalAnswers} Total Answers</p>
              <p className="text-gray-600 text-sm">{expert.totalApprovals} Approved</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-gray-600 text-sm mb-1">Moderator Acceptance</p>
              <p className="text-blue-900">{expert.moderatorAcceptanceRate}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Peer Votes</p>
              <p className="text-blue-900">{expert.peerVotesReceived}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Consistency Score</p>
              <p className="text-blue-900">{expert.consistencyScore}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Avg Response Time</p>
              <p className="text-blue-900">{expert.averageResponseTime}h</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'assigned'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'bg-white/50 text-blue-700 hover:bg-white/80'
            }`}
          >
            <FileText className="w-5 h-5" />
            Assigned Questions ({assignedQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'review'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'bg-white/50 text-blue-700 hover:bg-white/80'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Review & Vote ({reviewQuestions.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'assigned' && (
            <>
              {assignedQuestions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No questions assigned to you at the moment</p>
                </div>
              ) : (
                assignedQuestions.map(question => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    expertId={expert.id}
                    onClick={() => setSelectedQuestion(question)}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'review' && (
            <>
              {reviewQuestions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No questions available for review</p>
                </div>
              ) : (
                reviewQuestions.map(question => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    expertId={expert.id}
                    onClick={() => setSelectedQuestion(question)}
                    showReviewMode
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
