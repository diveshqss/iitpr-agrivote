import React from 'react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-800 mb-6">Admin Dashboard</h1>
        <p className="text-lg text-gray-700 mb-8">
          Welcome to the Admin section. Here you can manage system settings, user roles, platform analytics, and oversee the entire AgriVote application.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">System Settings</h3>
            <p className="text-gray-600">Configure platform settings and features.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">User Administration</h3>
            <p className="text-gray-600">Manage user accounts and role assignments.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Analytics</h3>
            <p className="text-gray-600">Monitor usage statistics and system performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
