import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLeaveApprovals } from '../hooks/useLeaveApprovals';
import { LeaveApproval } from '../components/leave-requests/LeaveApproval';

export function LeaveApprovals() {
  const {
    pendingRequests,
    loading,
    error,
    approveRequest,
    rejectRequest,
  } = useLeaveApprovals();

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading pending requests...
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leave Approvals</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Review and manage pending leave requests
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-dark-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            No pending requests
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All leave requests have been processed
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <LeaveApproval
              key={request.id}
              request={request}
              onApprove={approveRequest}
              onReject={rejectRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}