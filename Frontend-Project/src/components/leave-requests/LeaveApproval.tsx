import React from 'react';
import { format } from 'date-fns';
import { Check, X, MessageCircle, Calendar, Clock, User } from 'lucide-react';

interface LeaveApprovalProps {
  request: any;
  onApprove: (id: string, notes: string) => Promise<void>;
  onReject: (id: string, notes: string) => Promise<void>;
}

export function LeaveApproval({
  request,
  onApprove,
  onReject,
}: LeaveApprovalProps) {
  const [notes, setNotes] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      setError(null);
      
      if (action === 'approve') {
        await onApprove(request.id, notes);
      } else {
        await onReject(request.id, notes);
      }
    } catch (error: any) {
      setError(error.message || `Error ${action}ing request`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total days
  const start = new Date(request.start_date);
  const end = new Date(request.end_date);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-dark-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
            {request.user?.full_name[0]}
          </div>
          <div>
            <h3 className="font-medium">{request.user?.full_name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {request.user?.department}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium capitalize">{request.leave_type} Leave</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Balance: {request.leave_balance} days
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-dark-700">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
            <p className="font-medium">
              {format(new Date(request.start_date), 'MMM d, yyyy')} -{' '}
              {format(new Date(request.end_date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-dark-700">
          <Clock className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Days</p>
            <p className="font-medium">{totalDays} days</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-dark-700">
          <User className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hours per Day</p>
            <p className="font-medium">{request.hours_per_day}h</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-3 dark:border-dark-700">
        <p className="text-sm font-medium">Reason</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {request.reason}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes
        </label>
        <div className="relative">
          <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            placeholder="Add approval notes..."
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={() => handleAction('reject')}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:border-dark-700 dark:text-gray-300 dark:hover:bg-dark-700"
        >
          <X className="h-4 w-4" />
          Reject
        </button>
        <button
          onClick={() => handleAction('approve')}
          disabled={loading || totalDays > request.leave_balance}
          className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Approve
            </>
          )}
        </button>
      </div>
    </div>
  );
}