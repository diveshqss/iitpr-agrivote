import { useState, useEffect } from 'react';
import { ArrowLeft, Send, AlertTriangle, CheckCircle, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { farmerAPI } from '../lib/api';
import { AppNav } from '../layouts/app-nav';
import { Question } from '../types';

interface FarmerPortalProps {
  onBack: () => void;
}

export function FarmerPortal({ onBack }: FarmerPortalProps) {
  const { token } = useAuth();
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [questionData, setQuestionData] = useState<Question | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (submitting || !question.trim() || !token) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await farmerAPI.submitQuestion({
        text: question.trim()
      }, token);

      // Expected response format: { status: "success", message: "...", data: { question_id: "..." } }
      setQuestionId(response.data.question_id);
      localStorage.setItem('current_question_id', response.data.question_id);
      setIsPolling(true);

    } catch (error) {
      console.error('Failed to submit question:', error);
      setSubmitError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Polling effect
  useEffect(() => {
    if (!questionId || !isPolling) return;

    const pollQuestion = async () => {
      try {
        const response = await farmerAPI.getQuestion(questionId, token || undefined);
        const questionInfo = response.data.question;

        setQuestionData(questionInfo);

        // Check status
        if (questionInfo.status === 'duplicate') {
          setIsPolling(false);
        } else if (['assigned', 'approved'].includes(questionInfo.status)) {
          setIsPolling(false);
        }

      } catch (error) {
        console.error('Failed to poll question:', error);
        setPollError(error instanceof Error ? error.message : 'Failed to check question status');
      }
    };

    // Poll immediately and then every 3 seconds
    pollQuestion();
    const interval = setInterval(pollQuestion, 3000);

    return () => clearInterval(interval);
  }, [questionId, isPolling, token]);

  // Processing screen
  if (questionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <AppNav />
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {(questionData as any).status === 'duplicate' ? (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-orange-900 mb-3">Similar Question Found</h2>
                <p className="text-orange-700 mb-6">
                  Your question appears to be similar to an existing one that has already been answered.
                </p>
                <div className="bg-orange-50 rounded-lg p-6 text-left">
                  <h3 className="text-orange-900 mb-3 font-semibold">Answer:</h3>
                  <div className="text-orange-800">
                    {(questionData as any).answer || "Answer will be displayed here."}
                  </div>
                </div>
                <button
                  onClick={onBack}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 mt-6"
                >
                  Back to Home
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-green-900 mb-3">Question Submitted Successfully!</h2>
                <p className="text-green-700 mb-6">
                  Experts have been allocated to answer your question. We'll notify you once the answer is ready.
                </p>
                <div className="text-sm text-gray-600 mb-6">
                  Question ID: {questionId}
                </div>
                <button
                  onClick={onBack}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Back to Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Processing screen while polling
  if (isPolling) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <AppNav />
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-blue-900 mb-3">Processing Your Question</h2>
            <p className="text-blue-700 mb-6">
              Our AI is analyzing your question and allocating expert reviewers...
            </p>
            {pollError && (
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{pollError}</p>
              </div>
            )}
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Cancel and go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Input screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-green-900 mb-2">Submit Your Agricultural Question</h2>
          <p className="text-green-700 mb-6">
            Our AI system will analyze your question and connect you with expert agricultural advisors
          </p>

          {submitError && (
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-red-800 mb-2">{submitError}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 min-h-[150px] focus:border-green-500 focus:outline-none"
                placeholder="Describe your agricultural problem or question in detail..."
              />
              <p className="text-gray-500 text-sm mt-2">
                Be as specific as possible. Include details like crop type, symptoms, location, and timing.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !question.trim()}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Question
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
