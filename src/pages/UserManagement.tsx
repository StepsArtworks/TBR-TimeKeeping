import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export function UserManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only allow access to admin users
  if (user?.role !== 'admin') {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-200">
            Access denied. Only admin users can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage system users and permissions
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600">
          <Plus className="h-5 w-5" />
          Add User
        </button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
        <h2 className="text-lg font-medium">Users</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          User management functionality will be implemented here.
        </p>
      </div>
    </div>
  );
}