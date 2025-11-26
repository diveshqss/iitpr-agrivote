import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AgriVote Nexus</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
              <Link href="/experts" className="text-gray-600 hover:text-gray-900 transition-colors">Experts</Link>
              <Link href="/questions" className="text-gray-600 hover:text-gray-900 transition-colors">Questions</Link>
              <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-16 pb-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AgriVote Nexus
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The Future of Multi-Expert Agricultural Decision Systems
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Where AI intelligence meets human expertise. Farmers receive scientifically validated, consensus-driven answers from the world's agricultural professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all">
                Ask a Question
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all">
                Become an Expert
              </button>
            </div>
          </div>

          {/* AI Intelligence Visual */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {['🤖 Domain Classification', '🔍 Duplicate Detection', '✨ Question Cleanup', '⚡ Expert Allocation', '📊 Answer Scoring'].map((feature, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="text-2xl mb-2">{feature.split(' ')[0]}</div>
                <div className="text-sm text-gray-600 font-medium">{feature.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow Visualization */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Intelligent Review Flow</h2>
            <p className="text-lg text-gray-600">How AgriVote Nexus transforms agricultural questions into verified answers</p>
          </div>

          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 -translate-y-1/2"></div>

            <div className="grid md:grid-cols-5 gap-8">
              {[
                {
                  step: '1',
                  title: 'Question Intake',
                  description: 'AI classifies domain and detects duplicates',
                  icon: '📝',
                  color: 'from-green-500 to-green-600'
                },
                {
                  step: '2',
                  title: 'Expert Allocation',
                  description: 'AI assigns top experts based on performance metrics',
                  icon: '👥',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  step: '3',
                  title: 'Collaborative Answers',
                  description: 'Experts provide and review answers, vote on quality',
                  icon: '💬',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  step: '4',
                  title: 'Moderator Review',
                  description: 'Final quality check and expert consensus validation',
                  icon: '✅',
                  color: 'from-orange-500 to-orange-600'
                },
                {
                  step: '5',
                  title: 'Verified Answer',
                  description: 'Published in knowledge base for future reference',
                  icon: '📚',
                  color: 'from-red-500 to-red-600'
                }
              ].map((item, index) => (
                <div key={index} className="relative bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4`}>
                    {item.step}
                  </div>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Advanced AI-Powered Features</h2>
            <p className="text-lg text-gray-600">Revolutionary technology ensuring agricultural accuracy and reliability</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Domain Classification',
                description: 'Automatic categorization into crop, soil, irrigation, pest, disease, fertilizer, machinery, and subsidy domains',
                icon: '🏷️',
                bg: 'bg-green-50'
              },
              {
                title: 'Semantic Duplicate Detection',
                description: 'ML-powered similarity analysis prevents redundant questions and suggests existing solutions',
                icon: '🔍',
                bg: 'bg-blue-50'
              },
              {
                title: 'Smart Expert Allocation',
                description: 'AI evaluates past performance, accuracy, and specialization to assign optimal experts',
                icon: '🎯',
                bg: 'bg-purple-50'
              },
              {
                title: 'Answer Quality Scoring',
                description: 'Multi-dimensional evaluation of accuracy, completeness, safety, and practicality',
                icon: '📊',
                bg: 'bg-orange-50'
              },
              {
                title: 'Peer Review System',
                description: 'Experts vote, modify, and improve answers collaboratively before moderator review',
                icon: '👥',
                bg: 'bg-indigo-50'
              },
              {
                title: 'Quality Assurance Loop',
                description: 'Rejected answers trigger reallocation with contextual learning for better results',
                icon: '🔄',
                bg: 'bg-red-50'
              }
            ].map((feature, index) => (
              <div key={index} className={`${feature.bg} rounded-xl p-6 hover:scale-105 transition-transform`}>
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="py-20 bg-white rounded-3xl shadow-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Impact at Scale</h2>
            <p className="text-lg text-gray-600">Real-world results from AgriVote Nexus implementation</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '15,000+', label: 'Questions Processed' },
              { value: '2,500+', label: 'Expert Contributions' },
              { value: '98.5%', label: 'Accuracy Rate' },
              { value: '45min', label: 'Average Response Time' }
            ].map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Revolutionize Agricultural Decision-Making?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of farmers and experts already benefiting from the power of collective agricultural intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all">
                Start Your Journey
              </button>
              <button className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-xl font-bold">AgriVote Nexus</span>
              </div>
              <p className="text-gray-400 text-sm">
                The future of collaborative agricultural decision systems.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Expert Network</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Knowledge Base</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Research Papers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 AgriVote Nexus. Empowering farmers through AI and collective expertise.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
