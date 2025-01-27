import React from 'react';
import { format } from 'date-fns';
import { Check, X, MessageCircle } from 'lucide-react';

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

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      if (action === 'approve') {
        await onApprove(request.id, notes);
      } else {
        await onReject(request.id, notes);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-dark-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{request.user?.full_name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(request.start_date), 'MMM d, yyyy')} -{' '}
            {format(new Date(request.end_date), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Approve
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
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
    </div>
  );
}