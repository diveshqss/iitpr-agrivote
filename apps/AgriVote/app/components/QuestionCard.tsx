import { Clock, Users, MessageSquare, CheckCircle } from 'lucide-react';
import { Question } from '../types';
import { domainColors } from '../lib/data';

interface QuestionCardProps {
  question: Question;
  expertId: string;
  onClick: () => void;
  showReviewMode?: boolean;
}

export function QuestionCard({ question, expertId, onClick, showReviewMode }: QuestionCardProps) {
  const myAnswer = question.answers.find(a => a.expertId === expertId);
  const hasAnswered = !!myAnswer;
  const otherAnswers = question.answers.filter(a => a.expertId !== expertId);
  
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 ${domainColors[question.domain].bg} ${domainColors[question.domain].text} rounded-full text-sm`}>
              {question.domain}
            </span>
            {hasAnswered && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Answered
              </span>
            )}
          </div>
          <h3 className="text-gray-900 mb-2">{question.cleanedQuestion}</h3>
          <p className="text-gray-600 text-sm">Asked by: {question.farmerName}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          {timeAgo(question.submittedAt)}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">{question.allocatedExperts.length} experts assigned</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">{question.answers.length} answers</span>
        </div>
        {showReviewMode && otherAnswers.length > 0 && (
          <span className="ml-auto text-blue-600 text-sm">
            {otherAnswers.length} answer(s) to review
          </span>
        )}
      </div>

      {hasAnswered && myAnswer && (
        <div className="mt-4 bg-blue-50 rounded-lg p-3">
          <p className="text-blue-900 text-sm mb-1">Your Answer:</p>
          <p className="text-blue-800 text-sm line-clamp-2">{myAnswer.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-blue-700 text-sm">
              AI Score: {myAnswer.aiQualityScore}/100
            </span>
            <span className="text-blue-700 text-sm">
              Votes: {myAnswer.votes}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
