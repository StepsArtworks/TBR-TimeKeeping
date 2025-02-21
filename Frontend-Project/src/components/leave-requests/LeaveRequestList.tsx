import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';

interface LeaveRequestListProps {
  requests: any[];
  loading: boolean;
  error: string | null;
  onEdit: (request: any) => void;
  onDelete: (id: string) => Promise<void>;
}

export function LeaveRequestList({
  requests,
  loading,
  error,
  onEdit,
  onDelete,
}: LeaveRequestListProps) {
  const { user } = useAuth();
  const isLead = user?.role === 'lead';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading leave requests...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-dark-700">
        <Calendar className="mx-auto h-8 w-8 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          No leave requests
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new leave request using the button above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-dark-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
          <thead>
            <tr>
              {isLead && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Reason
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
            {requests.map((request) => (
              <tr
                key={request.id}
                className="group hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                {isLead && (
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/20">
                        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-400">
                          {request.user?.full_name[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {request.user?.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {request.user?.department}
                        </div>
                      </div>
                    </div>
                  </td>
                )}
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="capitalize">{request.leave_type}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {format(new Date(request.start_date), 'MMM d, yyyy')}
                      {' - '}
                      {format(new Date(request.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{request.hours_per_day}h/day</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                      request.status
                    )}`}
                  >
                    <span
                      className={`mr-1.5 h-2 w-2 rounded-full ${getStatusColor(
                        request.status
                      )}`}
                    />
                    {request.status}
                  </span>
                </td>
                <td className="max-w-md px-6 py-4">
                  <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                    {request.reason}
                  </p>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  {request.status === 'pending' && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(request)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-dark-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(request.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-dark-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}