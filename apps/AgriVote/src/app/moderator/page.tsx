import React from 'react';

export default function ModeratorPage() {
  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-800 mb-6">Moderator Dashboard</h1>
        <p className="text-lg text-gray-700 mb-8">
          Welcome to the Moderator section. Here you can manage community content, handle reports, and ensure quality standards across the platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Content Moderation</h3>
            <p className="text-gray-600">Review and approve user-generated content.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">User Management</h3>
            <p className="text-gray-600">Handle user reports and maintain community standards.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Quality Assurance</h3>
            <p className="text-gray-600">Monitor and improve content quality metrics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
