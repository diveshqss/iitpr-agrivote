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

      const qId = response.data.question_id;
      setQuestionId(qId);
      localStorage.setItem('current_question_id', qId);
      setIsPolling(true);

    } catch (error) {
      console.error('Failed to submit question:', error);
      setSubmitError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadLastQuestion = () => {
    const lastQuestionId = localStorage.getItem('current_question_id');
    if (lastQuestionId) {
      setQuestionId(lastQuestionId);
      setIsPolling(true);
      setPollError(null);
      setQuestionData(null);
    }
  };

  const handleReset = () => {
    setQuestionId(null);
    setQuestionData(null);
    setQuestion('');
    setIsPolling(false);
    localStorage.removeItem('current_question_id');
  };

  useEffect(() => {
    if (!questionId || !isPolling) return;

    let pollCount = 0;
    const MAX_POLL_ATTEMPTS = 20;

    const pollQuestion = async () => {
      try {
        const response = await farmerAPI.getQuestion(questionId);
        const questionInfo = response.data.question;

        setQuestionData(questionInfo);
        setPollError(null);
        pollCount = 0;

        if (['assigned', 'duplicate'].includes(questionInfo.status)) {
          setIsPolling(false);
        }

    } catch (error) {
      pollCount++;
      console.error('Failed to poll question:', error);

      if (pollCount >= MAX_POLL_ATTEMPTS) {
        setIsPolling(false);
        localStorage.removeItem('current_question_id');
      }
    }
    };

    pollQuestion();
    const interval = setInterval(pollQuestion, 3000);

    return () => clearInterval(interval);
  }, [questionId, isPolling, token]);

  if (questionData && ['duplicate', 'assigned'].includes(questionData.status)) {
    const isDuplicate = questionData.status === 'duplicate';

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <AppNav />
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {isDuplicate ? (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-orange-900 mb-3">Similar Question Found</h2>
                <p className="text-orange-700 mb-6">
                  Your question appears to be similar to an existing one that has already been answered.
                </p>
                <div className="bg-orange-50 rounded-lg p-6 text-left">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Answer:</h3>
                  <div className="text-orange-800">
                    {questionData.answer || 'Answer not available now'}
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 mt-6 transition-colors"
                >
                  Ask Another Question
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-900 mb-3">Question Submitted Successfully!</h2>
                <p className="text-green-700 mb-6">
                  Experts have been allocated to answer your question. We'll notify you once the answer is ready.
                </p>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Question ID:</p>
                  <p className="text-lg font-mono text-green-800">{questionId}</p>
                </div>
                <button
                  onClick={onBack}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

  if (isPolling) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-3">Processing Your Question</h2>
            <p className="text-blue-700 mb-6">
              Our AI is analyzing your question and allocating expert reviewers...
            </p>
            {pollError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm font-medium mb-2">Connection Issue</p>
                <p className="text-red-700 text-sm">{pollError}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setIsPolling(false);
                  setPollError(null);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors px-4 py-2 border border-blue-300 rounded-lg"
              >
                Stop Checking
              </button>
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                Go Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lastQuestionId = localStorage.getItem('current_question_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-green-700 hover:text-green-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          {lastQuestionId && (
            <button
              onClick={handleLoadLastQuestion}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Load Last Question
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-2">Submit Your Agricultural Question</h2>
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
              <label className="block text-gray-700 font-medium mb-2">Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 min-h-[150px] focus:border-green-500 focus:outline-none transition-colors"
                placeholder="Describe your agricultural problem or question in detail..."
              />
              <p className="text-gray-500 text-sm mt-2">
                Be as specific as possible. Include details like crop type, symptoms, location, and timing.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !question.trim()}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
