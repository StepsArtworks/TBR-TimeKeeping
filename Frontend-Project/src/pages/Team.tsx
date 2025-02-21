import React from 'react';
import { Mail, Phone, Building, Calendar } from 'lucide-react';
import { users } from '../lib/mockData';
import { useAuth } from '../components/AuthProvider';

export function Team() {
  const { user: currentUser } = useAuth();

  // Filter team members based on user role and department
  const teamMembers = users.filter(user => {
    if (currentUser?.role === 'management') return true;
    if (currentUser?.role === 'lead') return user.department === currentUser.department;
    return user.department === currentUser.department;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          View and manage team members
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-dark-800"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                {member.full_name[0]}
              </div>
              <div>
                <h3 className="font-medium">{member.full_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {member.role}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building className="h-4 w-4" />
                <span>{member.department}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Leave Balance: {member.vacation_balance}d vacation,{' '}
                  {member.sick_balance}d sick
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}