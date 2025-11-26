import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Sparkles, ThumbsUp, Trophy, AlertTriangle } from 'lucide-react';
import { Question, Answer, ModeratorReview, RejectionHistory } from '../types';
import { domainColors, getExpertById, experts } from '../lib/data';
import { allocateExperts, generateRejectionContext } from '../lib/ai-services';

interface ModeratorReviewPanelProps {
  question: Question;
  onBack: () => void;
  onUpdate: (updatedQuestion: Question) => void;
}

export function ModeratorReviewPanel({ question, onBack, onUpdate }: ModeratorReviewPanelProps) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const sortedAnswers = [...question.answers].sort((a, b) => {
    // Sort by AI quality score, then by votes
    if (b.aiQualityScore !== a.aiQualityScore) {
      return b.aiQualityScore - a.aiQualityScore;
    }
    return b.votes - a.votes;
  });

  const topAnswer = sortedAnswers[0];

  const handleApprove = () => {
    if (!selectedAnswerId) {
      alert('Please select an answer to approve');
      return;
    }

    const review: ModeratorReview = {
      moderatorId: 'moderator-1',
      moderatorName: 'Dr. Suresh Reddy',
      decision: 'approved',
      feedback: feedback || 'Answer approved',
      reviewedAt: new Date().toISOString(),
      selectedAnswerId
    };

    const updatedQuestion: Question = {
      ...question,
      status: 'approved',
      moderatorReview: review
    };

    onUpdate(updatedQuestion);
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      alert('Please provide rejection feedback');
      return;
    }

    // Generate AI context for new experts
    const aiContext = generateRejectionContext(
      question.cleanedQuestion,
      question.answers,
      feedback
    );

    // AI allocates new experts (excluding previous ones)
    const newExpertIds = allocateExperts(question.domain, experts.filter(e => 
      !question.allocatedExperts.includes(e.id)
    ));

    const rejectionEntry: RejectionHistory = {
      attempt: (question.rejectionHistory?.length || 0) + 1,
      expertIds: question.allocatedExperts,
      reason: feedback,
      rejectedAt: new Date().toISOString(),
      aiContext
    };

    const review: ModeratorReview = {
      moderatorId: 'moderator-1',
      moderatorName: 'Dr. Suresh Reddy',
      decision: 'rejected',
      feedback,
      reviewedAt: new Date().toISOString()
    };

    const updatedQuestion: Question = {
      ...question,
      status: 'reallocated',
      moderatorReview: review,
      rejectionHistory: [...(question.rejectionHistory || []), rejectionEntry],
      allocatedExperts: newExpertIds,
      answers: [] // Clear previous answers for fresh start
    };

    onUpdate(updatedQuestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-purple-900 mb-4">Question to Review</h2>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 ${domainColors[question.domain].bg} ${domainColors[question.domain].text} rounded-full text-sm`}>
                  {question.domain}
                </span>
                <span className="text-gray-600 text-sm">Asked by: {question.farmerName}</span>
              </div>
              <p className="text-gray-900 mb-4">{question.cleanedQuestion}</p>
              
              <details className="text-sm">
                <summary className="text-purple-600 cursor-pointer hover:text-purple-800">
                  View original question
                </summary>
                <p className="text-gray-600 mt-2 pl-4">{question.originalQuestion}</p>
              </details>
            </div>

            {/* AI Recommendation */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6" />
                <h3>AI Recommendation</h3>
              </div>
              <p className="text-purple-100 text-sm mb-3">
                Based on quality scoring and peer voting, the AI system recommends:
              </p>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="mb-2">Top Answer by: {getExpertById(topAnswer.expertId)?.name || 'Expert'}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span>AI Score: {topAnswer.aiQualityScore}/100</span>
                  <span>Votes: {topAnswer.votes}</span>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="space-y-4">
              <h3 className="text-purple-900">Expert Answers ({question.answers.length})</h3>
              {sortedAnswers.map((answer, idx) => {
                const answerExpert = getExpertById(answer.expertId);
                const isSelected = selectedAnswerId === answer.id;
                const isTopAnswer = idx === 0;

                return (
                  <div
                    key={answer.id}
                    className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50'
                        : isTopAnswer
                        ? 'border-yellow-400 bg-yellow-50/30'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {isTopAnswer && (
                          <div className="flex items-center gap-2 mb-2 text-yellow-700">
                            <Trophy className="w-5 h-5" />
                            <span className="text-sm">AI Top-Ranked Answer</span>
                          </div>
                        )}
                        <p className="text-gray-900 mb-1">{answerExpert?.name || 'Expert'}</p>
                        <p className="text-gray-600 text-sm">{answerExpert?.specialization.join(', ')}</p>
                      </div>
                      <button
                        onClick={() => setSelectedAnswerId(answer.id)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>

                    <p className="text-gray-800 mb-4">{answer.content}</p>

                    <div className="flex items-center gap-4 pt-4 border-t text-sm">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-900">{answer.votes} votes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-900">AI Score: {answer.aiQualityScore}/100</span>
                      </div>
                      <span className="text-gray-600">
                        {new Date(answer.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* AI Quality Suggestions */}
                    {answer.aiQualitySuggestions.length > 0 && (
                      <details className="mt-4">
                        <summary className="text-sm text-purple-600 cursor-pointer hover:text-purple-800">
                          View AI quality suggestions
                        </summary>
                        <div className="mt-2 space-y-1 pl-4">
                          {answer.aiQualitySuggestions.map((suggestion, idx) => (
                            <p key={idx} className="text-sm text-gray-600">• {suggestion}</p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Expert Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-purple-900 mb-4">Assigned Experts</h3>
              <div className="space-y-3">
                {question.allocatedExperts.map(expertId => {
                  const expert = getExpertById(expertId);
                  const expertAnswer = question.answers.find(a => a.expertId === expertId);
                  
                  return (
                    <div key={expertId} className="border-b pb-3 last:border-b-0">
                      <p className="text-gray-900 text-sm mb-1">{expert?.name}</p>
                      <p className="text-gray-600 text-xs mb-2">{expert?.specialization.join(', ')}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600">{expert?.accuracyScore}% accuracy</span>
                        {expertAnswer ? (
                          <span className="text-blue-600">Answered</span>
                        ) : (
                          <span className="text-gray-400">No answer</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rejection History */}
            {question.rejectionHistory && question.rejectionHistory.length > 0 && (
              <div className="bg-red-50 rounded-xl shadow-lg p-6 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-red-900">Previous Rejections</h3>
                </div>
                <p className="text-red-800 text-sm mb-2">
                  This question has been rejected {question.rejectionHistory.length} time(s)
                </p>
                {question.rejectionHistory.map((rejection, idx) => (
                  <div key={idx} className="text-sm text-red-700 mb-2">
                    <p>Attempt {rejection.attempt}: {rejection.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Moderator Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-purple-900 mb-4">Moderator Actions</h3>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Feedback/Comments</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 min-h-[100px] text-sm focus:border-purple-500 focus:outline-none"
                  placeholder="Provide feedback on the answer quality..."
                />
              </div>

              {!showRejectionForm ? (
                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    disabled={!selectedAnswerId}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Answer
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject & Reallocate
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-50 rounded-lg p-4 text-sm mb-3">
                    <p className="text-red-900 mb-2">Rejection will:</p>
                    <ul className="text-red-800 space-y-1 text-xs">
                      <li>• Clear existing answers</li>
                      <li>• AI will allocate new experts</li>
                      <li>• New experts receive rejection context</li>
                      <li>• Question enters new review cycle</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleReject}
                    disabled={!feedback.trim()}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(false)}
                    className="w-full border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
