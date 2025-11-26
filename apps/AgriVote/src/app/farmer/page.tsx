import React from 'react';

export default function FarmerPage() {
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 mb-6">Farmer Dashboard</h1>
        <p className="text-lg text-gray-700 mb-8">
          Welcome to the Farmer section. Here you can manage your agricultural activities, view recommendations, and interact with experts.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Crop Management</h3>
            <p className="text-gray-600">Monitor and manage your crops.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Expert Advice</h3>
            <p className="text-gray-600">Get recommendations from agricultural experts.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Community</h3>
            <p className="text-gray-600">Connect with other farmers and share experiences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
