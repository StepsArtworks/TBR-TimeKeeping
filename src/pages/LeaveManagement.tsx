import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle2 } from 'lucide-react';
import { LeaveRequestForm } from '../components/leave-requests/LeaveRequestForm';
import { LeaveRequestList } from '../components/leave-requests/LeaveRequestList';
import { LeaveBalance } from '../components/leave-requests/LeaveBalance';
import { LeaveCalendar } from '../components/leave-requests/LeaveCalendar';
import { LeaveApproval } from '../components/leave-requests/LeaveApproval';
import { useLeaveRequests } from '../hooks/useLeaveRequests';
import { useLeaveApprovals } from '../hooks/useLeaveApprovals';
import { useAuth } from '../components/AuthProvider';

export function LeaveManagement() {
  const { user } = useAuth();
  const isApprover = user?.role === 'lead' || user?.role === 'management';
  const [activeTab, setActiveTab] = useState<'requests' | 'approvals' | 'approved'>('requests');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    balances,
    createRequest,
    updateRequest,
    deleteRequest,
  } = useLeaveRequests();

  const {
    pendingRequests,
    approvedRequests,
    loading: approvalsLoading,
    error: approvalsError,
    approveRequest,
    rejectRequest,
  } = useLeaveApprovals();

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
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your time off and view leave balances
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isApprover && (
            <div className="flex rounded-lg border border-gray-200 dark:border-dark-700">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'requests'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700'
                }`}
              >
                My Requests
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'approvals'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700'
                }`}
              >
                Approvals
                {pendingRequests.length > 0 && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'approved'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700'
                }`}
              >
                Approved
              </button>
            </div>
          )}
          {activeTab === 'requests' && (
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
          )}
        </div>
      </div>

      <LeaveBalance balances={balances} />

      {activeTab === 'requests' ? (
        <>
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
              loading={requestsLoading}
              error={requestsError}
              onEdit={setEditingRequest}
              onDelete={deleteRequest}
            />
          )}
        </>
      ) : activeTab === 'approvals' ? (
        <div className="space-y-4">
          {approvalsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Loading pending requests...
                </p>
              </div>
            </div>
          ) : approvalsError ? (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                {approvalsError}
              </p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-dark-700">
              <CalendarIcon className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No pending requests
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                All leave requests have been processed
              </p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <LeaveApproval
                key={request.id}
                request={request}
                onApprove={approveRequest}
                onReject={rejectRequest}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-medium">Approved Leave Requests</h2>
            </div>
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
          </div>

          {viewMode === 'calendar' ? (
            <LeaveCalendar
              requests={approvedRequests}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          ) : (
            <LeaveRequestList
              requests={approvedRequests}
              loading={approvalsLoading}
              error={approvalsError}
              onEdit={null}
              onDelete={null}
            />
          )}
        </div>
      )}
    </div>
  );
}