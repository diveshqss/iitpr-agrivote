import { useState } from 'react';
import { FarmerPortal } from '../components/FarmerPortal';
import { ExpertDashboard } from '../components/ExpertDashboard';
import { ModeratorDashboard } from '../components/ModeratorDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { Sprout, Users, Shield, Settings } from 'lucide-react';

type UserRole = 'farmer' | 'expert' | 'moderator' | 'admin' | null;

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [expertId, setExpertId] = useState<string>('');

  if (currentRole === 'farmer') {
    return <FarmerPortal onBack={() => setCurrentRole(null)} />;
  }

  if (currentRole === 'expert' && expertId) {
    return <ExpertDashboard expertId={expertId} onBack={() => { setCurrentRole(null); setExpertId(''); }} />;
  }

  if (currentRole === 'moderator') {
    return <ModeratorDashboard onBack={() => setCurrentRole(null)} />;
  }

  if (currentRole === 'admin') {
    return <AdminDashboard onBack={() => setCurrentRole(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sprout className="w-12 h-12 text-green-600" />
            <h1 className="text-green-800">AgriVote Nexus</h1>
          </div>
          <p className="text-green-700 max-w-2xl mx-auto">
            The Future of Multi-Expert Agricultural Decision Systems
          </p>
          <p className="text-green-600 mt-2 max-w-3xl mx-auto">
            Collaborative AI-powered platform where multiple experts review, vote, and finalize the best agricultural advice for farmers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Farmer Portal */}
          <button
            onClick={() => setCurrentRole('farmer')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-green-100 hover:border-green-300"
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-green-900 mb-2">Farmer Portal</h3>
            <p className="text-green-600 text-sm">
              Submit questions and receive expert-verified answers
            </p>
          </button>

          {/* Expert Portal */}
          <button
            onClick={() => {
              const id = prompt('Enter your Expert ID (expert-1, expert-2, expert-3, expert-4, or expert-5):');
              if (id) {
                setExpertId(id);
                setCurrentRole('expert');
              }
            }}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-blue-100 hover:border-blue-300"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-blue-900 mb-2">Expert Portal</h3>
            <p className="text-blue-600 text-sm">
              Answer questions, review peers, and vote on solutions
            </p>
          </button>

          {/* Moderator Portal */}
          <button
            onClick={() => setCurrentRole('moderator')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-purple-100 hover:border-purple-300"
          >
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-purple-900 mb-2">Moderator Portal</h3>
            <p className="text-purple-600 text-sm">
              Review and finalize top-voted expert answers
            </p>
          </button>

          {/* Admin Portal */}
          <button
            onClick={() => setCurrentRole('admin')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-orange-100 hover:border-orange-300"
          >
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-orange-900 mb-2">Admin Portal</h3>
            <p className="text-orange-600 text-sm">
              View analytics, expert performance, and system metrics
            </p>
          </button>
        </div>

        {/* Features */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-green-900 mb-6 text-center">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-green-900">AI Domain Classification</p>
                  <p className="text-green-600 text-sm">Automatic categorization into 8 domains</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-green-900">Semantic Duplicate Detection</p>
                  <p className="text-green-600 text-sm">Prevents redundant questions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-green-900">AI Question Cleanup</p>
                  <p className="text-green-600 text-sm">Improves clarity and completeness</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-green-900">Expert Performance Scoring</p>
                  <p className="text-green-600 text-sm">AI-powered allocation system</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-blue-900">Multi-Expert Review</p>
                  <p className="text-blue-600 text-sm">Collaborative answer evaluation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-blue-900">Voting Mechanism</p>
                  <p className="text-blue-600 text-sm">5 votes trigger moderator review</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-blue-900">AI Answer Ranking</p>
                  <p className="text-blue-600 text-sm">Automatic quality scoring</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-blue-900">Smart Reallocation</p>
                  <p className="text-blue-600 text-sm">Rejection triggers expert reassignment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
