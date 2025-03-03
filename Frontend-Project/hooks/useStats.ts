import { useState, useEffect } from 'react';
import { useStats as useStatsApi } from '../lib/api';

export function useStats() {
  const {
    weeklyHours,
    expectedWeeklyHours,
    monthlyHours,
    expectedMonthlyHours,
    upcomingDeadlines,
    completedProjects,
    projectProgress,
    timeDistribution,
    projectDistribution,
    leaveBalances,
    loading,
    error,
  } = useStatsApi();

  return {
    weeklyHours,
    expectedWeeklyHours,
    monthlyHours,
    expectedMonthlyHours,
    upcomingDeadlines,
    completedProjects,
    projectProgress,
    timeDistribution,
    projectDistribution,
    leaveBalances,
    loading,
    error,
  };
}