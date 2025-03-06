import { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';
import { useAuth } from '../components/AuthProvider';
import { getLeaveRequests, updateLeaveRequest } from '../lib/api';

export function useLeaveApprovals() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user || (!isLead(user.role) && !isManagement(user.role))) return;

    try {
      setLoading(true);
      const data = await getLeaveRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error loading leave requests:', err);
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: string, notes: string) => {
    try {
      const updatedRequest = await updateLeaveRequest(id, {
        status: 'approved',
        approved_by: user!.id,
        approved_at: new Date().toISOString(),
        notes,
      });

      setRequests(prev =>
        prev.map(request =>
          request.id === id ? updatedRequest : request
        )
      );
    } catch (err) {
      console.error('Error approving request:', err);
      throw err;
    }
  };

  const rejectRequest = async (id: string, notes: string) => {
    try {
      const updatedRequest = await updateLeaveRequest(id, {
        status: 'rejected',
        approved_by: user!.id,
        approved_at: new Date().toISOString(),
        notes,
      });

      setRequests(prev =>
        prev.map(request =>
          request.id === id ? updatedRequest : request
        )
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
      throw err;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');

  return {
    pendingRequests,
    approvedRequests,
    loading,
    error,
    approveRequest,
    rejectRequest,
  };
}

function isLead(role: string): boolean {
  return role === 'lead';
}

function isManagement(role: string): boolean {
  return role === 'management';
}