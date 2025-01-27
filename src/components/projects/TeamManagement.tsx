import React from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Briefcase,
  MoreVertical,
} from 'lucide-react';
import { User as UserType } from '../../types';

interface TeamManagementProps {
  members: UserType[];
  onAssign: (userId: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

export function TeamManagement({
  members,
  onAssign,
  onRemove,
}: TeamManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Team Members</h2>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600">
          <User className="h-5 w-5" />
          Add Member
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="relative rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-dark-800"
          >
            <div className="absolute right-4 top-4">
              <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-dark-700">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                {member.full_name[0]}
              </div>
              <div>
                <h3 className="font-medium">{member.full_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <Briefcase className="h-4 w-4" />
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

            <div className="mt-6 flex items-center justify-between border-t pt-4 dark:border-dark-700">
              <button
                onClick={() => onRemove(member.id)}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove from Project
              </button>
              <button className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-100 dark:hover:bg-dark-600">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}