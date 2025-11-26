import { useState } from 'react';
import { ArrowLeft, Send, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { classifyDomain, cleanupQuestion, detectDuplicates } from '../lib/ai-services';
import { DuplicateMatch, Domain } from '../types';
import { domainColors } from '../lib/data';
import { API_ENDPOINTS } from '../lib/config';
import { AppNav } from '../layouts/app-nav';

interface FarmerPortalProps {
  onBack: () => void;
}

export function FarmerPortal({ onBack }: FarmerPortalProps) {
  const [step, setStep] = useState<'input' | 'cleanup' | 'duplicate-check' | 'submit'>('input');
  const [farmerName, setFarmerName] = useState('');
  const [originalQuestion, setOriginalQuestion] = useState('');
  const [cleanedQuestion, setCleanedQuestion] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!originalQuestion.trim() || !farmerName.trim()) return;

    // AI Domain Classification
    const detectedDomain = classifyDomain(originalQuestion);
    setDomain(detectedDomain);

    // AI Question Cleanup
    const { cleaned, suggestions: aiSuggestions } = cleanupQuestion(originalQuestion);
    setCleanedQuestion(cleaned);
    setSuggestions(aiSuggestions);

    setStep('cleanup');
  };

  const handleCheckDuplicates = () => {
    if (!domain) return;

    // AI Semantic Duplicate Detection
    const matches = detectDuplicates(cleanedQuestion, domain);
    setDuplicates(matches);

    setStep('duplicate-check');
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(API_ENDPOINTS.SUBMIT_QUESTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanedQuestion,
          metadata: {
            farmerName,
            domain,
            duplicatesFound: duplicates.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Question submitted successfully:', data);

      setSubmitted(true);
      setTimeout(() => {
        setStep('submit');
      }, 1000);
    } catch (error) {
      console.error('Failed to submit question:', error);
      setSubmitError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'submit' || submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <AppNav />
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-green-900 mb-3">Question Submitted Successfully!</h2>
            <p className="text-green-700 mb-6">
              Your question has been received and is being processed by our AI system.
            </p>

            <div className="bg-green-50 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <h3 className="text-green-900">What happens next?</h3>
              </div>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">1.</span>
                  <span>AI allocates your question to top experts in <span className="font-semibold">{domain}</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">2.</span>
                  <span>Multiple experts review and provide answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">3.</span>
                  <span>Experts vote on the best answer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">4.</span>
                  <span>A moderator reviews and finalizes the answer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">5.</span>
                  <span>You'll receive the verified, expert-approved answer</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setStep('input');
                setFarmerName('');
                setOriginalQuestion('');
                setCleanedQuestion('');
                setSuggestions([]);
                setDomain(null);
                setDuplicates([]);
                setSubmitted(false);
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Submit Another Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'duplicate-check') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setStep('cleanup')}
            className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-green-900">AI Duplicate Detection</h2>
            </div>

            {duplicates.length === 0 ? (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-green-900 mb-2">No Similar Questions Found</p>
                    <p className="text-green-700 text-sm">
                      Your question appears to be unique. It will be sent to our expert panel for review.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="bg-amber-50 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-amber-900 mb-1">Similar Questions Found</p>
                    <p className="text-amber-700 text-sm">
                      We found {duplicates.length} similar question(s) that have already been answered.
                      You may find your answer below.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {duplicates.map((dup, idx) => (
                    <div key={idx} className="border-2 border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                          {dup.similarity}% Similar
                        </span>
                        <span className={`px-3 py-1 ${domainColors[dup.domain].bg} ${domainColors[dup.domain].text} rounded-full text-sm`}>
                          {dup.domain}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-3">{dup.question}</p>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-green-900 text-sm mb-2">Expert-Approved Answer:</p>
                        <p className="text-green-800">{dup.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitError && (
              <div className="bg-red-50 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-red-900 mb-1">Submission Failed</p>
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit My Question Anyway
                  </>
                )}
              </button>
              {duplicates.length > 0 && (
                <button
                  onClick={onBack}
                  className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                >
                  I Found My Answer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'cleanup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setStep('input')}
            className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h2 className="text-green-900">AI Analysis Results</h2>
            </div>

            {/* Domain Classification */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Detected Domain</label>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 ${domainColors[domain!].bg} ${domainColors[domain!].text} rounded-lg border-2 ${domainColors[domain!].border}`}>
                  {domain}
                </span>
                <span className="text-green-600 text-sm">
                  AI classified your question automatically
                </span>
              </div>
            </div>

            {/* Original Question */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Your Original Question</label>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 border-2 border-gray-200">
                {originalQuestion}
              </div>
            </div>

            {/* Cleaned Question */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">AI-Improved Question</label>
              <textarea
                value={cleanedQuestion}
                onChange={(e) => setCleanedQuestion(e.target.value)}
                className="w-full border-2 border-green-300 rounded-lg p-4 min-h-[100px] bg-green-50"
                placeholder="Edit the AI-improved version..."
              />
              <p className="text-green-600 text-sm mt-2">
                You can edit this version before submitting
              </p>
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">AI Suggestions for Improvement</label>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                      <p className="text-blue-800 text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleCheckDuplicates}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              Continue to Duplicate Check
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Your Question</label>
              <textarea
                value={originalQuestion}
                onChange={(e) => setOriginalQuestion(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 min-h-[150px] focus:border-green-500 focus:outline-none"
                placeholder="Describe your agricultural problem or question in detail..."
              />
              <p className="text-gray-500 text-sm mt-2">
                Be as specific as possible. Include details like crop type, symptoms, location, and timing.
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!originalQuestion.trim() || !farmerName.trim()}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Analyze Question with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
