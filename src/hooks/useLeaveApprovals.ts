import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useLeaveApprovals() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('role, department')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          user:users(id, full_name, department)
        `)
        .eq('status', 'pending');

      // If lead, only show department requests
      if (userData.role === 'lead') {
        query = query.eq('user.department', userData.department);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setPendingRequests(data || []);
    } catch (err) {
      setError('Failed to load pending requests');
      console.error('Error loading pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const approveRequest = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approval_notes: notes,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchPendingRequests();
    } catch (err) {
      console.error('Error approving request:', err);
      throw err;
    }
  };

  const rejectRequest = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          approval_notes: notes,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchPendingRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      throw err;
    }
  };

  return {
    pendingRequests,
    loading,
    error,
    approveRequest,
    rejectRequest,
    refresh: fetchPendingRequests,
  };
}