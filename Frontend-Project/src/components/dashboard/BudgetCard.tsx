import React from 'react';
import { formatCurrency } from '../../lib/utils';

interface BudgetCardProps {
  projectName: string;
  budget: number;
  spent: number;
  percentage: number;
}

export function BudgetCard({ projectName, budget, spent, percentage }: BudgetCardProps) {
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
      <h3 className="font-medium text-gray-900 dark:text-gray-100">{projectName}</h3>
      <div className="mt-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(spent)} of {formatCurrency(budget)}
          </span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-dark-700">
          <div
            className={`h-2 rounded-full ${getProgressColor(percentage)}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}