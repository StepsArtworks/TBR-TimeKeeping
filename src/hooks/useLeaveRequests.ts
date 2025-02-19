import { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';
import { db } from '../lib/db';
import { useAuth } from '../components/AuthProvider';
import { useLiveQuery } from 'dexie-react-hooks';

export function useLeaveRequests() {
  const { user } = useAuth();
  const isLead = user?.role === 'lead';
  const isManagement = user?.role === 'management';

  // Use live query for leave requests
  const requests = useLiveQuery(
    async () => {
      if (!user) return [];

      try {
        let query = db.leaveRequests;

        // For leads, get department requests
        if (isLead) {
          const departmentUsers = await db.users
            .where('department')
            .equals(user.department)
            .toArray();
          
          const departmentUserIds = departmentUsers.map(u => u.id);
          query = query.where('user_id').anyOf(departmentUserIds);
        }
        // For normal users, get only their requests
        else if (!isManagement) {
          query = query.where('user_id').equals(user.id);
        }

        const requests = await query.toArray();

        // Get user details for each request
        const userIds = [...new Set(requests.map(r => r.user_id))];
        const users = await db.users
          .where('id')
          .anyOf(userIds)
          .toArray();

        // Combine request and user data
        return requests.map(request => ({
          ...request,
          user: users.find(u => u.id === request.user_id),
        }));
      } catch (err) {
        console.error('Error loading leave requests:', err);
        return [];
      }
    },
    [user]
  );

  // Get user's leave balances
  const balances = useLiveQuery(
    async () => {
      if (!user) return null;

      try {
        const userDetails = await db.users.get(user.id);
        return userDetails ? {
          vacation: userDetails.vacation_balance,
          sick: userDetails.sick_balance,
          personal: userDetails.personal_balance,
        } : null;
      } catch (err) {
        console.error('Error loading leave balances:', err);
        return null;
      }
    },
    [user]
  );

  const createRequest = async (data: any) => {
    try {
      if (!user) throw new Error('Not authenticated');

      // Calculate total days
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalHours = totalDays * data.hoursPerDay;

      // Check leave balance
      const userDetails = await db.users.get(user.id);
      if (!userDetails) throw new Error('User not found');

      const balanceField = `${data.leaveType}_balance` as keyof typeof userDetails;
      const currentBalance = userDetails[balanceField] as number;
      
      if (totalDays > currentBalance) {
        throw new Error(`Insufficient ${data.leaveType} leave balance`);
      }

      const newRequest: LeaveRequest = {
        id: crypto.randomUUID(),
        user_id: user.id,
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        hours_per_day: parseFloat(data.hoursPerDay),
        reason: data.reason,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.leaveRequests.add(newRequest);
    } catch (err) {
      console.error('Error creating leave request:', err);
      throw err;
    }
  };

  const updateRequest = async (id: string, data: any) => {
    try {
      if (!user) throw new Error('Not authenticated');

      const request = await db.leaveRequests.get(id);
      if (!request) throw new Error('Request not found');

      // Only allow updates to pending requests
      if (request.status !== 'pending') {
        throw new Error('Cannot update processed requests');
      }

      // Calculate total days for new dates
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalHours = totalDays * data.hoursPerDay;

      // Check leave balance
      const userDetails = await db.users.get(user.id);
      if (!userDetails) throw new Error('User not found');

      const balanceField = `${data.leaveType}_balance` as keyof typeof userDetails;
      const currentBalance = userDetails[balanceField] as number;
      
      if (totalDays > currentBalance) {
        throw new Error(`Insufficient ${data.leaveType} leave balance`);
      }

      await db.leaveRequests.update(id, {
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        hours_per_day: parseFloat(data.hoursPerDay),
        reason: data.reason,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating leave request:', err);
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const request = await db.leaveRequests.get(id);
      if (!request) throw new Error('Request not found');

      // Only allow deletion of pending requests
      if (request.status !== 'pending') {
        throw new Error('Cannot delete processed requests');
      }

      await db.leaveRequests.delete(id);
    } catch (err) {
      console.error('Error deleting leave request:', err);
      throw err;
    }
  };

  return {
    requests: requests || [],
    loading: !requests,
    error: null,
    balances: balances || { vacation: 0, sick: 0, personal: 0 },
    createRequest,
    updateRequest,
    deleteRequest,
  };
}