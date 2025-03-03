import { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';
import { useAuth } from '../components/AuthProvider';
import { 
  useLeaveRequests as useLeaveRequestsApi, 
  useLeaveBalances,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest
} from '../lib/api';

export function useLeaveRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get leave requests from API
  const { 
    requests: apiRequests, 
    loading: apiLoading, 
    error: apiError 
  } = useLeaveRequestsApi();

  // Get leave balances from API
  const { 
    balances: apiBalances, 
    loading: balancesLoading, 
    error: balancesError 
  } = useLeaveBalances();

  useEffect(() => {
    if (apiLoading || balancesLoading) {
      setLoading(true);
      return;
    }

    if (apiError) {
      setError(apiError);
      setLoading(false);
      return;
    }

    if (balancesError) {
      setError(balancesError);
      setLoading(false);
      return;
    }

    setRequests(apiRequests);
    setLoading(false);
    setError(null);
  }, [apiRequests, apiLoading, apiError, balancesLoading, balancesError]);

  const handleCreateRequest = async (data: any) => {
    try {
      const newRequest = {
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        hours_per_day: parseFloat(data.hoursPerDay),
        reason: data.reason,
      };

      await createLeaveRequest(newRequest);
      // The API hook will refresh the data
    } catch (err) {
      console.error('Error creating leave request:', err);
      throw err;
    }
  };

  const handleUpdateRequest = async (id: string, data: any) => {
    try {
      const updatedRequest = {
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        hours_per_day: parseFloat(data.hoursPerDay),
        reason: data.reason,
      };

      await updateLeaveRequest(id, updatedRequest);
      // The API hook will refresh the data
    } catch (err) {
      console.error('Error updating leave request:', err);
      throw err;
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteLeaveRequest(id);
      // Remove the deleted request from the local state
      setRequests(requests.filter(request => request.id !== id));
    } catch (err) {
      console.error('Error deleting leave request:', err);
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    balances: apiBalances,
    createRequest: handleCreateRequest,
    updateRequest: handleUpdateRequest,
    deleteRequest: handleDeleteRequest,
  };
}