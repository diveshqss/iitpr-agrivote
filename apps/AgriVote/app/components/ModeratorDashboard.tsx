import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { questions as questionsData } from '../lib/data';
import { Question } from '../types';
import { ModeratorReviewPanel } from './ModeratorReviewPanel';

interface ModeratorDashboardProps {
  onBack: () => void;
}

export function ModeratorDashboard({ onBack }: ModeratorDashboardProps) {
  const [questions, setQuestions] = useState<Question[]>(questionsData);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    setQuestions([...questionsData]);
  }, []);

  const pendingQuestions = questions.filter(q => 
    q.status === 'ready_for_moderator' || 
    (q.answers.some(a => a.requestedModeratorReview) && q.status !== 'approved')
  );

  const approvedQuestions = questions.filter(q => q.status === 'approved');
  const rejectedQuestions = questions.filter(q => q.status === 'rejected' || q.status === 'reallocated');

  if (selectedQuestion) {
    return (
      <ModeratorReviewPanel
        question={selectedQuestion}
        onBack={() => setSelectedQuestion(null)}
        onUpdate={(updatedQuestion) => {
          setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
          setSelectedQuestion(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-purple-900 mb-2">Moderator Dashboard</h1>
          <p className="text-purple-700">Review and finalize expert answers</p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-900">Pending Review</span>
              </div>
              <p className="text-yellow-900">{pendingQuestions.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-900">Approved</span>
              </div>
              <p className="text-green-900">{approvedQuestions.length}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-900">Rejected/Reallocated</span>
              </div>
              <p className="text-red-900">{rejectedQuestions.length}</p>
            </div>
          </div>
        </div>

        {/* Pending Questions */}
        <div className="mb-8">
          <h2 className="text-purple-900 mb-4">Pending Review ({pendingQuestions.length})</h2>
          {pendingQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No questions pending review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQuestions.map(question => {
                const topAnswer = question.answers.reduce((prev, current) => 
                  current.votes > prev.votes ? current : prev
                , question.answers[0]);

                return (
                  <div
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-2">{question.cleanedQuestion}</h3>
                        <p className="text-gray-600 text-sm">Asked by: {question.farmerName}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex-shrink-0 ml-4">
                        Review Needed
                      </span>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 mb-4">
                      <p className="text-purple-900 text-sm mb-2">Top Answer ({topAnswer.votes} votes):</p>
                      <p className="text-purple-800 text-sm line-clamp-2">{topAnswer.content}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{question.answers.length} answers</span>
                      <span className="text-gray-600">{question.allocatedExperts.length} experts</span>
                      <span className="ml-auto text-purple-600">Click to review →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Approved Questions */}
        <div>
          <h2 className="text-green-900 mb-4">Recently Approved ({approvedQuestions.length})</h2>
          {approvedQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No approved questions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedQuestions.slice(0, 5).map(question => (
                <div key={question.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-2">{question.cleanedQuestion}</h3>
                      <p className="text-gray-600 text-sm">Asked by: {question.farmerName}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex-shrink-0 ml-4">
                      Approved
                    </span>
                  </div>

                  {question.moderatorReview && (
                    <div className="text-sm text-gray-600">
                      <p>Reviewed by: {question.moderatorReview.moderatorName}</p>
                      <p>Date: {new Date(question.moderatorReview.reviewedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
