import { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';
import { useAuth } from '../components/AuthProvider';
import { getLeaveRequests, createLeaveRequest, updateLeaveRequest, deleteLeaveRequest } from '../lib/api';

export function useLeaveRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState({
    vacation: 0,
    sick: 0,
    personal: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getLeaveRequests();
      setRequests(data);
      setError(null);

      // Update balances from user data
      setBalances({
        vacation: user.vacation_balance,
        sick: user.sick_balance,
        personal: user.personal_balance,
      });
    } catch (err) {
      console.error('Error loading leave requests:', err);
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (data: any) => {
    try {
      const newRequest = await createLeaveRequest({
        user_id: user!.id,
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        hours_per_day: parseFloat(data.hoursPerDay),
        reason: data.reason,
        status: 'pending',
      });

      setRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (err) {
      console.error('Error creating leave request:', err);
      throw err;
    }
  };

  const updateRequest = async (id: string, data: any) => {
    try {
      const updatedRequest = await updateLeaveRequest(id, {
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        hours_per_day: parseFloat(data.hoursPerDay),
        reason: data.reason,
      });

      setRequests(prev =>
        prev.map(request =>
          request.id === id ? updatedRequest : request
        )
      );
      return updatedRequest;
    } catch (err) {
      console.error('Error updating leave request:', err);
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      await deleteLeaveRequest(id);
      setRequests(prev => prev.filter(request => request.id !== id));
    } catch (err) {
      console.error('Error deleting leave request:', err);
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    balances,
    createRequest,
    updateRequest,
    deleteRequest,
  };
}