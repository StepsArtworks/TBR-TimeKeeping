import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: {
    current: number;
    target: number;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  progress,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-dark-800',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
      {trend && (
        <div className="mt-2 flex items-center">
          <span
            className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            vs last period
          </span>
        </div>
      )}
      {progress && (
        <div className="mt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">
              {Math.round((progress.current / progress.target) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-dark-700">
            <div
              className={cn(
                "h-2 rounded-full",
                progress.current >= progress.target ? "bg-green-500" : "bg-primary-500"
              )}
              style={{
                width: `${Math.min((progress.current / progress.target) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}