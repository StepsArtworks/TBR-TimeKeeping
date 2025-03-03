import { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';
import { useAuth } from '../components/AuthProvider';
import { 
  useLeaveApprovals as useLeaveApprovalsApi,
  approveRequest as approveRequestApi,
  rejectRequest as rejectRequestApi
} from '../lib/api';

export function useLeaveApprovals() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get leave approvals from API
  const { 
    pendingRequests: apiPendingRequests, 
    approvedRequests: apiApprovedRequests,
    loading: apiLoading, 
    error: apiError 
  } = useLeaveApprovalsApi();

  useEffect(() => {
    if (apiLoading) {
      setLoading(true);
      return;
    }

    if (apiError) {
      setError(apiError);
      setLoading(false);
      return;
    }

    setPendingRequests(apiPendingRequests);
    setApprovedRequests(apiApprovedRequests);
    setLoading(false);
    setError(null);
  }, [apiPendingRequests, apiApprovedRequests, apiLoading, apiError]);

  const approveRequest = async (id: string, notes: string) => {
    try {
      await approveRequestApi(id, notes);
      // Update local state
      const approvedRequest = pendingRequests.find(req => req.id === id);
      if (approvedRequest) {
        setPendingRequests(pendingRequests.filter(req => req.id !== id));
        setApprovedRequests([...approvedRequests, {
          ...approvedRequest,
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          notes
        }]);
      }
    } catch (err) {
      console.error('Error approving request:', err);
      throw err;
    }
  };

  const rejectRequest = async (id: string, notes: string) => {
    try {
      await rejectRequestApi(id, notes);
      // Update local state
      const rejectedRequest = pendingRequests.find(req => req.id === id);
      if (rejectedRequest) {
        setPendingRequests(pendingRequests.filter(req => req.id !== id));
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      throw err;
    }
  };

  return {
    pendingRequests,
    approvedRequests,
    loading,
    error,
    approveRequest,
    rejectRequest,
  };
}