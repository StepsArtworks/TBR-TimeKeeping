import React from 'react';
import { Plane, Heart as Heartbeat, User } from 'lucide-react';

interface LeaveBalanceProps {
  balances: {
    vacation: number;
    sick: number;
    personal: number;
  };
}

export function LeaveBalance({ balances }: LeaveBalanceProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vacation Leave
            </p>
            <p className="text-2xl font-semibold">
              {balances.vacation}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {' '}
                days
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <Heartbeat className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sick Leave
            </p>
            <p className="text-2xl font-semibold">
              {balances.sick}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {' '}
                days
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <User className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personal Leave
            </p>
            <p className="text-2xl font-semibold">
              {balances.personal}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {' '}
                days
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}