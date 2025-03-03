import React, { useState } from 'react';
import { Plus, Mail, Building, AlertCircle, Edit2, Trash2, Lock } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useUsers, createUser, updateUser, deleteUser } from '../lib/api';
import { User } from '../types';

interface UserEditForm {
  id: string;
  email: string;
  full_name: string;
  password: string;
  role: User['role'];
  department: string;
}

export function UserManagement() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<UserEditForm>({
    id: '',
    email: '',
    full_name: '',
    password: '',
    role: 'user',
    department: '',
  });

  // Get users from API
  const { users, loading: usersLoading, error: usersError } = useUsers();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editFormData.id) {
        // Update user
        await updateUser(editFormData.id, {
          email: editFormData.email,
          full_name: editFormData.full_name,
          password: editFormData.password,
          role: editFormData.role,
          department: editFormData.department,
        });
      } else {
        // Create new user
        await createUser({
          email: editFormData.email,
          full_name: editFormData.full_name,
          password: editFormData.password,
          role: editFormData.role,
          department: editFormData.department,
          vacation_balance: 20,
          sick_balance: 10,
          personal_balance: 5,
        } as Omit<User, 'id'>);
      }

      setShowForm(false);
      setEditFormData({
        id: '',
        email: '',
        full_name: '',
        password: '',
        role: 'user',
        department: '',
      });
      alert(editFormData.id ? 'User updated successfully!' : 'User created successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (u: User) => {
    setEditFormData({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      password: u.password,
      role: u.role,
      department: u.department,
    });
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(userId);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  if (usersLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-400">{usersError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage system users
          </p>
        </div>
        <button
          onClick={() => {
            setEditFormData({
              id: '',
              email: '',
              full_name: '',
              password: '',
              role: 'user',
              department: '',
            });
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          <Plus className="h-5 w-5" />
          Add User
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    required
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={editFormData.full_name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    required
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Role
                </label>
                <select
                  id="role"
                  required
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      role: e.target.value as User['role'],
                    }))
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
                >
                  <option value="user">User</option>
                  <option value="lead">Lead</option>
                  <option value="management">Management</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="department"
                    required
                    value={editFormData.department}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:text-gray-300 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  'Save User'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium">Users</h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-dark-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Department
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/20">
                        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-400">
                          {u.full_name[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {u.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-primary-100 px-2 text-xs font-semibold leading-5 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                      {u.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {u.department}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}