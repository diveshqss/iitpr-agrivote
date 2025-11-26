import React from 'react';

export default function ExpertPage() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-800 mb-6">Expert Dashboard</h1>
        <p className="text-lg text-gray-700 mb-8">
          Welcome to the Expert section. Here you can provide agricultural advice, review questions, and contribute to the community knowledge base.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Answer Questions</h3>
            <p className="text-gray-600">Respond to farmer queries and provide expert insights.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Review Content</h3>
            <p className="text-gray-600">Moderate and validate agricultural information.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Analytics</h3>
            <p className="text-gray-600">View impact metrics and community engagement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
