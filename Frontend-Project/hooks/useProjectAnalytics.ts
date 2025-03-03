import { useState, useEffect } from 'react';
import { useProjectAnalytics as useProjectAnalyticsApi } from '../lib/api';

export function useProjectAnalytics(projectId: string) {
  const {
    metrics,
    timeData,
    taskData,
    loading,
    error,
  } = useProjectAnalyticsApi(projectId);

  return {
    metrics,
    timeData,
    taskData,
    loading,
    error,
  };
}