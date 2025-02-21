import { useState } from 'react';
import { LeaveRequest } from '../types';
import { db } from '../lib/db';
import { useAuth } from '../components/AuthProvider';
import { useLiveQuery } from 'dexie-react-hooks';

export function useLeaveApprovals() {
  const { user } = useAuth();
  const isLead = user?.role === 'lead';
  const isManagement = user?.role === 'management';

  // Use live query for requests
  const requests = useLiveQuery(
    async () => {
      if (!user || (!isLead && !isManagement)) return null;

      try {
        // For leads, only show department requests
        const departmentUsers = isLead
          ? await db.users
              .where('department')
              .equals(user.department)
              .toArray()
          : await db.users.toArray();

        const departmentUserIds = departmentUsers.map(u => u.id);

        // Get all requests for department users
        const allRequests = await db.leaveRequests
          .where('user_id')
          .anyOf(departmentUserIds)
          .toArray();

        // Get user details for each request
        const userIds = [...new Set(allRequests.map(r => r.user_id))];
        const users = await db.users
          .where('id')
          .anyOf(userIds)
          .toArray();

        // Combine request and user data
        return allRequests.map(request => ({
          ...request,
          user: users.find(u => u.id === request.user_id),
          leave_balance: users.find(u => u.id === request.user_id)?.[`${request.leave_type}_balance`] || 0
        }));
      } catch (err) {
        console.error('Error loading requests:', err);
        return [];
      }
    },
    [user]
  );

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const approvedRequests = requests?.filter(r => r.status === 'approved') || [];

  const approveRequest = async (id: string, notes: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      await db.transaction('rw', [db.leaveRequests, db.users], async () => {
        const request = await db.leaveRequests.get(id);
        if (!request) throw new Error('Request not found');

        // Calculate total days
        const start = new Date(request.start_date);
        const end = new Date(request.end_date);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Update user's leave balance
        const requestUser = await db.users.get(request.user_id);
        if (!requestUser) throw new Error('User not found');

        const balanceField = `${request.leave_type}_balance` as keyof typeof requestUser;
        const currentBalance = requestUser[balanceField] as number;
        
        if (totalDays > currentBalance) {
          throw new Error(`Insufficient ${request.leave_type} leave balance`);
        }

        // Update user's balance
        await db.users.update(request.user_id, {
          [balanceField]: currentBalance - totalDays,
          updated_at: new Date().toISOString()
        });

        // Update request status
        await db.leaveRequests.update(id, {
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes,
          updated_at: new Date().toISOString()
        });
      });
    } catch (err) {
      console.error('Error approving request:', err);
      throw err;
    }
  };

  const rejectRequest = async (id: string, notes: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      await db.leaveRequests.update(id, {
        status: 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        notes,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error rejecting request:', err);
      throw err;
    }
  };

  return {
    pendingRequests,
    approvedRequests,
    loading: !requests,
    error: null,
    approveRequest,
    rejectRequest,
  };
}