import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { questions as questionsData, getExpertById } from '../lib/data';
import { Question } from '../types';
import { QuestionCard } from './QuestionCard';
import { AnswerSubmission } from './AnswerSubmission';
import { ReviewAnswers } from './ReviewAnswers';

interface ExpertDashboardProps {
  expertId: string;
  onBack: () => void;
}

export function ExpertDashboard({ expertId, onBack }: ExpertDashboardProps) {
  const [activeTab, setActiveTab] = useState<'assigned' | 'review'>('assigned');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>(questionsData);
  
  const expert = getExpertById(expertId);

  useEffect(() => {
    setQuestions([...questionsData]);
  }, []);

  if (!expert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-red-600">Expert not found. Please check your Expert ID.</p>
          </div>
        </div>
      </div>
    );
  }

  const assignedQuestions = questions.filter(q => 
    q.allocatedExperts.includes(expertId) && 
    ['allocated', 'in_review'].includes(q.status)
  );

  const reviewQuestions = questions.filter(q => 
    q.allocatedExperts.includes(expertId) && 
    q.answers.length > 0 &&
    q.status === 'in_review'
  );

  if (selectedQuestion) {
    const myAnswer = selectedQuestion.answers.find(a => a.expertId === expertId);
    
    if (myAnswer) {
      return (
        <ReviewAnswers
          question={selectedQuestion}
          expertId={expertId}
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
          expertId={expertId}
          onBack={() => setSelectedQuestion(null)}
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
              <p className="text-blue-700">Expert ID: {expertId}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {expert.specialization.map(spec => (
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
                    expertId={expertId}
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
                    expertId={expertId}
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
