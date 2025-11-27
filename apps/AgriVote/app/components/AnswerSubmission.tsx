import { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Lightbulb } from 'lucide-react';
import { Question, Answer, AnswerCreate } from '../types';
import { generateAnswerDraft, generateQualitySuggestions, calculateAnswerQualityScore } from '../lib/ai-services';
import { generateAnswerId, domainColors } from '../lib/data';
import { expertAPI } from '../lib/api';

interface AnswerSubmissionProps {
  question: Question;
  expertId: string;
  onBack: () => void;
  onSubmit: (updatedQuestion: Question) => void;
}

export function AnswerSubmission({ question, expertId, onBack, onSubmit }: AnswerSubmissionProps) {
  const [answer, setAnswer] = useState('');
  const [showAIDraft, setShowAIDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const aiDraft = generateAnswerDraft(question.cleanedQuestion, question.domain);
  const qualitySuggestions = answer.length > 20 ? generateQualitySuggestions(answer, question.cleanedQuestion) : [];
  const qualityScore = answer.length > 20 ? calculateAnswerQualityScore(answer, question.cleanedQuestion) : 0;

  const handleUseAIDraft = () => {
    setAnswer(aiDraft);
    setShowAIDraft(false);
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    try {
      setIsSubmitting(true);

      // Call the backend API to submit the answer
      const answerData: AnswerCreate = {
        answer_text: answer,
        images: [] // Could add image support later
      };

      await expertAPI.submitAnswer(question.id, answerData);

      // After successful save, update local state and go back
      onBack(); // Go back to dashboard instead of updating question locally

    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-blue-900 mb-6">Submit Your Answer</h2>

          {/* Question Display */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 ${domainColors[question.domain].bg} ${domainColors[question.domain].text} rounded-full text-sm`}>
                {question.domain}
              </span>
              <span className="text-gray-600 text-sm">Asked by: {question.farmerName}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <p className="text-gray-900">{question.cleanedQuestion}</p>
            </div>

            {/* Original Question */}
            {question.originalQuestion !== question.cleanedQuestion && (
              <details className="mt-2">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                  View original question
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">{question.originalQuestion}</p>
              </details>
            )}

            {/* AI Suggestions from Question */}
            {question.aiSuggestions.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-900 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  AI identified missing information
                </summary>
                <div className="mt-2 pl-4 space-y-1">
                  {question.aiSuggestions.map((suggestion, idx) => (
                    <p key={idx} className="text-sm text-gray-600">• {suggestion}</p>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* AI Draft Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowAIDraft(!showAIDraft)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-3"
            >
              <Sparkles className="w-5 h-5" />
              {showAIDraft ? 'Hide AI Draft Answer' : 'Show AI Draft Answer'}
            </button>

            {showAIDraft && (
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200 mb-4">
                <p className="text-purple-900 mb-2 text-sm">AI-Generated Draft (Optional):</p>
                <p className="text-purple-800 mb-4">{aiDraft}</p>
                <button
                  onClick={handleUseAIDraft}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                >
                  Use This Draft as Starting Point
                </button>
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Your Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full border-2 border-blue-300 rounded-lg p-4 min-h-[250px] focus:border-blue-500 focus:outline-none"
              placeholder="Provide your expert answer here. Be specific, actionable, and include measurements, dosages, and timeframes where applicable..."
            />
          </div>

          {/* AI Quality Score */}
          {answer.length > 20 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700">AI Quality Score</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  qualityScore >= 80 ? 'bg-green-100 text-green-700' :
                  qualityScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {qualityScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    qualityScore >= 80 ? 'bg-green-500' :
                    qualityScore >= 60 ? 'bg-yellow-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${qualityScore}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* AI Quality Suggestions */}
          {qualitySuggestions.length > 0 && (
            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <p className="text-blue-900">AI Quality Improvement Suggestions</p>
                </div>
                <div className="space-y-2">
                  {qualitySuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 text-sm">•</span>
                      <p className="text-blue-800 text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rejection Context (if applicable) */}
          {question.rejectionHistory && question.rejectionHistory.length > 0 && (
            <div className="mb-6">
              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                <p className="text-red-900 mb-2">⚠️ This question was previously rejected</p>
                <p className="text-red-800 text-sm mb-2">
                  <strong>Moderator feedback:</strong> {question.rejectionHistory[question.rejectionHistory.length - 1].reason}
                </p>
                <details>
                  <summary className="text-sm text-red-700 cursor-pointer hover:text-red-900">
                    View AI context for improvement
                  </summary>
                  <pre className="text-xs text-red-800 mt-2 whitespace-pre-wrap">
                    {question.rejectionHistory[question.rejectionHistory.length - 1].aiContext}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}
