import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { User } from '../../types';
import { useUsers } from '../../lib/api';
import { useAuth } from '../AuthProvider';

interface TeamMembersProps {
  members: User[];
}

export function TeamMembers({ members }: TeamMembersProps) {
  const { user: currentUser } = useAuth();
  const { users, loading, error } = useUsers();

  // Filter team members based on user role and department
  const teamMembers = users?.filter(user => {
    if (currentUser?.role === 'management') return true;
    if (currentUser?.role === 'lead') return user.department === currentUser.department;
    return user.department === currentUser.department;
  }) || [];

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading team members...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {teamMembers.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-dark-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
            {member.full_name[0]}
          </div>
          <div>
            <h3 className="font-medium">{member.full_name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {member.department}
            </p>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <span>{member.email}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}