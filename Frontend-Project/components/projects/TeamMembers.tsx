import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { User } from '../../types';

interface TeamMembersProps {
  members: User[];
}

export function TeamMembers({ members }: TeamMembersProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
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