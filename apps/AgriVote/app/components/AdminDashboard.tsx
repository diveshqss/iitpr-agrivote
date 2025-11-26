import { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, FileText, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { questions, experts, domainColors } from '../lib/data';
import { Domain } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'experts' | 'questions'>('overview');

  const totalQuestions = questions.length;
  const approvedQuestions = questions.filter(q => q.status === 'approved').length;
  const pendingQuestions = questions.filter(q => 
    q.status === 'pending_allocation' || q.status === 'allocated' || q.status === 'in_review'
  ).length;
  const readyForModerator = questions.filter(q => q.status === 'ready_for_moderator').length;
  const rejectedQuestions = questions.filter(q => q.status === 'rejected' || q.status === 'reallocated').length;

  const totalAnswers = questions.reduce((sum, q) => sum + q.answers.length, 0);
  const avgAnswersPerQuestion = totalQuestions > 0 ? (totalAnswers / totalQuestions).toFixed(1) : '0';

  // Domain distribution
  const domainDistribution: Record<Domain, number> = {
    crop: 0,
    soil: 0,
    irrigation: 0,
    pest: 0,
    disease: 0,
    fertilizer: 0,
    machinery: 0,
    subsidy: 0
  };
  
  questions.forEach(q => {
    domainDistribution[q.domain]++;
  });

  // Expert rankings
  const rankedExperts = [...experts].sort((a, b) => {
    const scoreA = (a.accuracyScore + a.moderatorAcceptanceRate + a.consistencyScore) / 3;
    const scoreB = (b.accuracyScore + b.moderatorAcceptanceRate + b.consistencyScore) / 3;
    return scoreB - scoreA;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-orange-700 hover:text-orange-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-orange-900 mb-2">Admin Analytics Dashboard</h1>
          <p className="text-orange-700">System-wide metrics and expert performance</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              selectedTab === 'overview'
                ? 'bg-white text-orange-900 shadow-lg'
                : 'bg-white/50 text-orange-700 hover:bg-white/80'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('experts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              selectedTab === 'experts'
                ? 'bg-white text-orange-900 shadow-lg'
                : 'bg-white/50 text-orange-700 hover:bg-white/80'
            }`}
          >
            <Users className="w-5 h-5" />
            Expert Performance
          </button>
          <button
            onClick={() => setSelectedTab('questions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              selectedTab === 'questions'
                ? 'bg-white text-orange-900 shadow-lg'
                : 'bg-white/50 text-orange-700 hover:bg-white/80'
            }`}
          >
            <FileText className="w-5 h-5" />
            Question Analytics
          </button>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-gray-600 text-sm">Total Questions</p>
                    <p className="text-blue-900">{totalQuestions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-gray-600 text-sm">Approved</p>
                    <p className="text-green-900">{approvedQuestions}</p>
                    <p className="text-gray-500 text-xs">
                      {totalQuestions > 0 ? Math.round((approvedQuestions / totalQuestions) * 100) : 0}% success rate
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-yellow-900">{pendingQuestions}</p>
                    <p className="text-gray-500 text-xs">In progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-gray-600 text-sm">Active Experts</p>
                    <p className="text-purple-900">{experts.length}</p>
                    <p className="text-gray-500 text-xs">{totalAnswers} total answers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-orange-900 mb-4">Question Status Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 text-sm">Approved</span>
                      <span className="text-green-600">{approvedQuestions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${totalQuestions > 0 ? (approvedQuestions / totalQuestions) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 text-sm">In Review</span>
                      <span className="text-yellow-600">{pendingQuestions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${totalQuestions > 0 ? (pendingQuestions / totalQuestions) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 text-sm">Ready for Moderator</span>
                      <span className="text-purple-600">{readyForModerator}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${totalQuestions > 0 ? (readyForModerator / totalQuestions) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 text-sm">Rejected/Reallocated</span>
                      <span className="text-red-600">{rejectedQuestions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${totalQuestions > 0 ? (rejectedQuestions / totalQuestions) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-orange-900 mb-4">Domain Distribution</h3>
                <div className="space-y-2">
                  {(Object.keys(domainDistribution) as Domain[]).map(domain => {
                    const count = domainDistribution[domain];
                    const percentage = totalQuestions > 0 ? (count / totalQuestions) * 100 : 0;
                    
                    return (
                      <div key={domain} className="flex items-center gap-3">
                        <span className={`px-3 py-1 ${domainColors[domain].bg} ${domainColors[domain].text} rounded-full text-xs w-24 text-center`}>
                          {domain}
                        </span>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${domainColors[domain].bg.replace('100', '500')}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-gray-600 text-sm w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-orange-900 mb-4">System Metrics</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Avg Answers/Question</p>
                  <p className="text-orange-900">{avgAnswersPerQuestion}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Avg Expert Accuracy</p>
                  <p className="text-orange-900">
                    {Math.round(experts.reduce((sum, e) => sum + e.accuracyScore, 0) / experts.length)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Avg Response Time</p>
                  <p className="text-orange-900">
                    {(experts.reduce((sum, e) => sum + e.averageResponseTime, 0) / experts.length).toFixed(1)}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Total Expert Votes</p>
                  <p className="text-orange-900">
                    {experts.reduce((sum, e) => sum + e.peerVotesReceived, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expert Performance Tab */}
        {selectedTab === 'experts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-orange-900 mb-4">Expert Rankings</h3>
              <div className="space-y-4">
                {rankedExperts.map((expert, idx) => {
                  const overallScore = Math.round(
                    (expert.accuracyScore + expert.moderatorAcceptanceRate + expert.consistencyScore) / 3
                  );

                  return (
                    <div key={expert.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            idx === 1 ? 'bg-gray-100 text-gray-700' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {idx === 0 && <Award className="w-6 h-6" />}
                            {idx > 0 && <span className="text-lg">#{idx + 1}</span>}
                          </div>
                          <div>
                            <p className="text-gray-900">{expert.name}</p>
                            <p className="text-gray-600 text-sm">{expert.id}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {expert.specialization.map(spec => (
                                <span key={spec} className={`px-2 py-1 ${domainColors[spec].bg} ${domainColors[spec].text} rounded-full text-xs`}>
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl mb-1 ${
                            overallScore >= 90 ? 'text-green-600' :
                            overallScore >= 80 ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {overallScore}
                          </p>
                          <p className="text-gray-600 text-xs">Overall Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Accuracy Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${expert.accuracyScore}%` }}
                              ></div>
                            </div>
                            <span className="text-green-600">{expert.accuracyScore}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-600 mb-1">Moderator Accept</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${expert.moderatorAcceptanceRate}%` }}
                              ></div>
                            </div>
                            <span className="text-blue-600">{expert.moderatorAcceptanceRate}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-600 mb-1">Consistency</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${expert.consistencyScore}%` }}
                              ></div>
                            </div>
                            <span className="text-purple-600">{expert.consistencyScore}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-600 mb-1">Performance</p>
                          <p className="text-gray-900">
                            {expert.totalApprovals}/{expert.totalAnswers} approved
                          </p>
                          <p className="text-gray-600 text-xs">{expert.peerVotesReceived} peer votes</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {selectedTab === 'questions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-orange-900 mb-4">Recent Questions</h3>
              <div className="space-y-4">
                {questions.slice().reverse().slice(0, 10).map(question => {
                  const statusColors = {
                    'approved': 'bg-green-100 text-green-700',
                    'rejected': 'bg-red-100 text-red-700',
                    'ready_for_moderator': 'bg-purple-100 text-purple-700',
                    'in_review': 'bg-blue-100 text-blue-700',
                    'allocated': 'bg-yellow-100 text-yellow-700',
                    'pending_allocation': 'bg-gray-100 text-gray-700',
                    'reallocated': 'bg-orange-100 text-orange-700'
                  };

                  return (
                    <div key={question.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{question.cleanedQuestion}</p>
                          <p className="text-gray-600 text-sm">Asked by: {question.farmerName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm flex-shrink-0 ml-4 ${statusColors[question.status]}`}>
                          {question.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                        <span className={`px-2 py-1 ${domainColors[question.domain].bg} ${domainColors[question.domain].text} rounded text-xs`}>
                          {question.domain}
                        </span>
                        <span>{question.answers.length} answers</span>
                        <span>{question.allocatedExperts.length} experts</span>
                        <span className="ml-auto">{new Date(question.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
