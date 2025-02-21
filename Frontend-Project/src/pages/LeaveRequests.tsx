import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { LeaveRequestForm } from '../components/leave-requests/LeaveRequestForm';
import { LeaveRequestList } from '../components/leave-requests/LeaveRequestList';
import { LeaveBalance } from '../components/leave-requests/LeaveBalance';
import { LeaveCalendar } from '../components/leave-requests/LeaveCalendar';
import { useLeaveRequests } from '../hooks/useLeaveRequests';

export function LeaveRequests() {
  const {
    requests,
    loading,
    error,
    balances,
    createRequest,
    updateRequest,
    deleteRequest,
  } = useLeaveRequests();
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleSubmit = async (data) => {
    try {
      if (editingRequest) {
        await updateRequest(editingRequest.id, data);
      } else {
        await createRequest(data);
      }
      setShowForm(false);
      setEditingRequest(null);
    } catch (err) {
      console.error('Error saving leave request:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Requests</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your time off and view leave balances
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-200 dark:border-dark-700">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700'
              }`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            New Request
          </button>
        </div>
      </div>

      <LeaveBalance balances={balances} />

      {(showForm || editingRequest) && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <LeaveRequestForm
            request={editingRequest}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingRequest(null);
            }}
          />
        </div>
      )}

      {viewMode === 'calendar' ? (
        <LeaveCalendar
          requests={requests}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      ) : (
        <LeaveRequestList
          requests={requests}
          loading={loading}
          error={error}
          onEdit={setEditingRequest}
          onDelete={deleteRequest}
        />
      )}
    </div>
  );
}