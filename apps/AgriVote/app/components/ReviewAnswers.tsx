import { useState } from 'react';
import { ArrowLeft, ThumbsUp, Edit2, Send, Trophy, Sparkles } from 'lucide-react';
import { Question, Answer } from '../types';
import { domainColors, getExpertById } from '../lib/data';
import { calculateAnswerQualityScore } from '../lib/ai-services';

interface ReviewAnswersProps {
  question: Question;
  expertId: string;
  onBack: () => void;
  onUpdate: (updatedQuestion: Question) => void;
}

export function ReviewAnswers({ question, expertId, onBack, onUpdate }: ReviewAnswersProps) {
  const [editingMyAnswer, setEditingMyAnswer] = useState(false);
  const [myAnswerContent, setMyAnswerContent] = useState('');
  
  const myAnswer = question.answers.find(a => a.expertId === expertId);
  const otherAnswers = question.answers.filter(a => a.expertId !== expertId);
  const sortedAnswers = [...question.answers].sort((a, b) => b.aiQualityScore - a.aiQualityScore);
  const topAnswer = sortedAnswers[0];

  const handleVote = (answerId: string) => {
    const updatedAnswers = question.answers.map(answer => {
      if (answer.id === answerId) {
        const hasVoted = answer.votedBy.includes(expertId);
        return {
          ...answer,
          votes: hasVoted ? answer.votes - 1 : answer.votes + 1,
          votedBy: hasVoted 
            ? answer.votedBy.filter(id => id !== expertId)
            : [...answer.votedBy, expertId]
        };
      }
      return answer;
    });

    const updatedQuestion = { ...question, answers: updatedAnswers };
    onUpdate(updatedQuestion);
  };

  const handleEditMyAnswer = () => {
    if (myAnswer) {
      setMyAnswerContent(myAnswer.content);
      setEditingMyAnswer(true);
    }
  };

  const handleSaveMyAnswer = () => {
    if (!myAnswer || !myAnswerContent.trim()) return;

    const updatedAnswers = question.answers.map(answer => {
      if (answer.id === myAnswer.id) {
        return {
          ...answer,
          content: myAnswerContent,
          lastModifiedAt: new Date().toISOString(),
          aiQualityScore: calculateAnswerQualityScore(myAnswerContent, question.cleanedQuestion)
        };
      }
      return answer;
    });

    const updatedQuestion = { ...question, answers: updatedAnswers };
    onUpdate(updatedQuestion);
    setEditingMyAnswer(false);
  };

  const handleRequestModeratorReview = () => {
    if (!myAnswer) return;

    const updatedAnswers = question.answers.map(answer => {
      if (answer.id === myAnswer.id) {
        return {
          ...answer,
          requestedModeratorReview: true
        };
      }
      return answer;
    });

    const updatedQuestion = { 
      ...question, 
      answers: updatedAnswers,
      status: myAnswer.votes >= 5 ? 'ready_for_moderator' : question.status
    };
    
    onUpdate(updatedQuestion);
  };

  const canRequestModeratorReview = myAnswer && myAnswer.votes >= 5 && !myAnswer.requestedModeratorReview;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-blue-900 mb-4">Question</h2>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 ${domainColors[question.domain].bg} ${domainColors[question.domain].text} rounded-full text-sm`}>
                  {question.domain}
                </span>
                <span className="text-gray-600 text-sm">Asked by: {question.farmerName}</span>
              </div>
              <p className="text-gray-900">{question.cleanedQuestion}</p>
            </div>

            {/* My Answer */}
            {myAnswer && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-blue-900">Your Answer</h3>
                  {!editingMyAnswer && (
                    <button
                      onClick={handleEditMyAnswer}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {editingMyAnswer ? (
                  <div>
                    <textarea
                      value={myAnswerContent}
                      onChange={(e) => setMyAnswerContent(e.target.value)}
                      className="w-full border-2 border-blue-300 rounded-lg p-4 min-h-[200px] mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveMyAnswer}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingMyAnswer(false)}
                        className="border-2 border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-800 mb-4">{myAnswer.content}</p>
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-900">{myAnswer.votes} votes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-900">AI Score: {myAnswer.aiQualityScore}/100</span>
                      </div>
                      {myAnswer.requestedModeratorReview && (
                        <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          Pending Moderator Review
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other Expert Answers */}
            <div className="space-y-4">
              <h3 className="text-blue-900">Other Expert Answers</h3>
              {otherAnswers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-600">No other answers yet. Be the first to provide guidance!</p>
                </div>
              ) : (
                otherAnswers.map(answer => {
                  const answerExpert = getExpertById(answer.expertId);
                  const hasVoted = answer.votedBy.includes(expertId);
                  const isTopAnswer = answer.id === topAnswer.id;

                  return (
                    <div
                      key={answer.id}
                      className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                        isTopAnswer ? 'border-yellow-400 bg-yellow-50/30' : 'border-transparent'
                      }`}
                    >
                      {isTopAnswer && (
                        <div className="flex items-center gap-2 mb-3 text-yellow-700">
                          <Trophy className="w-5 h-5" />
                          <span className="text-sm">AI Top-Ranked Answer</span>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-gray-900">{answerExpert?.name || 'Expert'}</p>
                          <p className="text-gray-600 text-sm">
                            {answerExpert?.specialization.join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleVote(answer.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            hasVoted
                              ? 'bg-blue-600 text-white'
                              : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
                          {answer.votes}
                        </button>
                      </div>

                      <p className="text-gray-800 mb-4">{answer.content}</p>

                      <div className="flex items-center gap-4 pt-4 border-t text-sm">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-900">AI Score: {answer.aiQualityScore}/100</span>
                        </div>
                        <span className="text-gray-600">
                          {new Date(answer.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Rules */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-blue-900 mb-4">Voting Rules</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700">
                    1
                  </div>
                  <p className="text-gray-700">Vote for high-quality answers that are accurate and helpful</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700">
                    2
                  </div>
                  <p className="text-gray-700">An answer needs 5 votes to be sent to moderator</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700">
                    3
                  </div>
                  <p className="text-gray-700">AI ranks answers by quality, accuracy, and completeness</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700">
                    4
                  </div>
                  <p className="text-gray-700">You can edit your answer anytime before moderator review</p>
                </div>
              </div>
            </div>

            {/* AI Rankings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-blue-900">AI Rankings</h3>
              </div>
              <div className="space-y-3">
                {sortedAnswers.map((answer, idx) => {
                  const answerExpert = getExpertById(answer.expertId);
                  const isMyAnswer = answer.expertId === expertId;
                  
                  return (
                    <div key={answer.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm">
                          {isMyAnswer ? 'You' : answerExpert?.name || 'Expert'}
                        </p>
                        <p className="text-gray-600 text-xs">Score: {answer.aiQualityScore}/100</p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 text-sm">
                        <ThumbsUp className="w-3 h-3" />
                        {answer.votes}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Request Moderator Review */}
            {canRequestModeratorReview && (
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="mb-3">Ready for Moderator Review!</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Your answer has received {myAnswer.votes} votes. You can now request moderator review.
                </p>
                <button
                  onClick={handleRequestModeratorReview}
                  className="w-full bg-white text-purple-600 py-2 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send to Moderator
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
