import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balances, setBalances] = useState({
    vacation: 0,
    sick: 0,
    personal: 0,
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Fetch leave requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch user balances
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('vacation_balance, sick_balance, personal_balance')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      setRequests(requestsData || []);
      setBalances({
        vacation: userData.vacation_balance,
        sick: userData.sick_balance,
        personal: userData.personal_balance,
      });
    } catch (err) {
      setError('Failed to load leave requests');
      console.error('Error loading leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const createRequest = async (data) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('leave_requests').insert([
        {
          user_id: user.id,
          leave_type: data.leaveType,
          start_date: data.startDate,
          end_date: data.endDate,
          hours_per_day: parseFloat(data.hoursPerDay),
          reason: data.reason,
          status: 'pending',
        },
      ]);

      if (error) throw error;
      await fetchRequests();
    } catch (err) {
      console.error('Error creating leave request:', err);
      throw err;
    }
  };

  const updateRequest = async (id, data) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          leave_type: data.leaveType,
          start_date: data.startDate,
          end_date: data.endDate,
          hours_per_day: parseFloat(data.hoursPerDay),
          reason: data.reason,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchRequests();
    } catch (err) {
      console.error('Error updating leave request:', err);
      throw err;
    }
  };

  const deleteRequest = async (id) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRequests();
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