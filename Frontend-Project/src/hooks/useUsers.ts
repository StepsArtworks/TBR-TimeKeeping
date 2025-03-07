import { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, createUser, updateUser, deleteUser } from '../lib/api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new user
  const addUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newUser = await createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  // Update an existing user
  const updateUserData = async (id: string, userData: Partial<User>) => {
    try {
      setError(null);
      const updatedUser = await updateUser(id, userData);
      setUsers(prev =>
        prev.map(user => (user.id === id ? updatedUser : user))
      );
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  // Delete a user
  const removeUser = async (id: string) => {
    try {
      setError(null);
      await deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  // Get a single user by ID
  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  // Refresh users list
  const refresh = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    addUser,
    updateUser: updateUserData,
    removeUser,
    getUserById,
    refresh,
  };
}