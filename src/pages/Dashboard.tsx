import React from 'react';
import { useAuth } from '../components/AuthProvider';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-dark-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {user?.department} - {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}