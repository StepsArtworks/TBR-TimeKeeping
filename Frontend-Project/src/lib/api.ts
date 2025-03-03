import { useState, useEffect, useCallback } from 'react';
import { Project, Task, TimeEntry, LeaveRequest, User, UserInvite } from '../types';

// Base path for the application
const BASE_PATH = '/tbrtimekeeping';
const API_BASE_URL = 'https://api.tbrhub.com';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
};

// Generic fetch hook
export function useFetch<T>(url: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: 'GET',
          headers,
          credentials: 'include',
          signal,
        });

        const result = await handleResponse(response);

        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted && err.name !== 'AbortError') {
          console.error(`Error fetching ${url}:`, err);
          setError(err.message || 'Failed to fetch data');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, dependencies);

  return { data, loading, error };
}

// ==================== PROJECTS API ====================

// Get all projects
export function useProjects() {
  const { data, loading, error } = useFetch<Project[]>('/projects');
  
  return {
    projects: data || [],
    loading,
    error,
  };
}

// Get project by ID
export function useProjectById(id: string) {
  const { data, loading, error } = useFetch<Project>(`/projects/${id}`, [id]);
  
  return {
    project: data,
    loading,
    error,
  };
}

// Create a new project
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(project),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error('Error creating project:', err);
    throw err;
  }
}

// Update an existing project
export async function updateProject(id: string, project: Partial<Project>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(project),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error updating project ${id}:`, err);
    throw err;
  }
}

// Delete a project
export async function deleteProject(id: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error deleting project ${id}:`, err);
    throw err;
  }
}

// ==================== TASKS API ====================

// Get all tasks, optionally filtered by project
export function useTasks(projectId?: string) {
  const url = projectId ? `/tasks?project_id=${projectId}` : '/tasks';
  const { data, loading, error } = useFetch<Task[]>(url, [projectId]);
  
  return {
    tasks: data || [],
    loading,
    error,
  };
}

// Get task by ID
export function useTaskById(id: string) {
  const { data, loading, error } = useFetch<Task>(`/tasks/${id}`, [id]);
  
  return {
    task: data,
    loading,
    error,
  };
}

// Create a new task
export async function createTask(task: Omit<Task, 'id'>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(task),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error('Error creating task:', err);
    throw err;
  }
}

// Update an existing task
export async function updateTask(id: string, task: Partial<Task>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(task),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error updating task ${id}:`, err);
    throw err;
  }
}

// Delete a task
export async function deleteTask(id: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error deleting task ${id}:`, err);
    throw err;
  }
}

// ==================== TIME ENTRIES API ====================

// Get time entries with optional filters
export function useTimeEntries(startDate?: string, endDate?: string, projectId?: string) {
  let url = '/time-entries';
  const params = new URLSearchParams();
  
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (projectId) params.append('project_id', projectId);
  
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  
  const { data, loading, error } = useFetch<TimeEntry[]>(url, [startDate, endDate, projectId]);
  
  return {
    entries: data || [],
    loading,
    error,
  };
}

// Get time entry by ID
export function useTimeEntryById(id: string) {
  const { data, loading, error } = useFetch<TimeEntry>(`/time-entries/${id}`, [id]);
  
  return {
    entry: data,
    loading,
    error,
  };
}

// Create a new time entry
export async function createTimeEntry(entry: Omit<TimeEntry, 'id'>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error('Error creating time entry:', err);
    throw err;
  }
}

// Update an existing time entry
export async function updateTimeEntry(id: string, entry: Partial<TimeEntry>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/time-entries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error updating time entry ${id}:`, err);
    throw err;
  }
}

// Delete a time entry
export async function deleteTimeEntry(id: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/time-entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error deleting time entry ${id}:`, err);
    throw err;
  }
}

// ==================== LEAVE REQUESTS API ====================

// Get all leave requests for the current user
export function useLeaveRequests() {
  const { data, loading, error } = useFetch<LeaveRequest[]>('/leave-requests');
  
  return {
    requests: data || [],
    loading,
    error,
  };
}

// Get leave request by ID
export function useLeaveRequestById(id: string) {
  const { data, loading, error } = useFetch<LeaveRequest>(`/leave-requests/${id}`, [id]);
  
  return {
    request: data,
    loading,
    error,
  };
}

// Create a new leave request
export async function createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'status' | 'approved_by' | 'approved_at'>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/leave-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error('Error creating leave request:', err);
    throw err;
  }
}

// Update an existing leave request
export async function updateLeaveRequest(id: string, request: Partial<LeaveRequest>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/leave-requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error updating leave request ${id}:`, err);
    throw err;
  }
}

// Delete a leave request
export async function deleteLeaveRequest(id: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/leave-requests/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error deleting leave request ${id}:`, err);
    throw err;
  }
}

// Get leave balances for the current user
export function useLeaveBalances() {
  const { data, loading, error } = useFetch<{
    vacation: number;
    sick: number;
    personal: number;
  }>('/leave-balances');
  
  return {
    balances: data || { vacation: 0, sick: 0, personal: 0 },
    loading,
    error,
  };
}

// ==================== LEAVE APPROVALS API ====================

// Get leave requests pending approval (for leads and managers)
export function useLeaveApprovals() {
  const { data, loading, error } = useFetch<{
    pendingRequests: (LeaveRequest & { 
      user: User;
      leave_balance: number;
    })[];
    approvedRequests: (LeaveRequest & { 
      user: User;
      leave_balance: number;
    })[];
  }>('/leave-approvals');
  
  return {
    pendingRequests: data?.pendingRequests || [],
    approvedRequests: data?.approvedRequests || [],
    loading,
    error,
  };
}

// Approve a leave request
export async function approveRequest(id: string, notes: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/leave-requests/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error approving leave request ${id}:`, err);
    throw err;
  }
}

// Reject a leave request
export async function rejectRequest(id: string, notes: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/leave-requests/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error rejecting leave request ${id}:`, err);
    throw err;
  }
}

// ==================== USERS API ====================

// Get all users
export function useUsers() {
  const { data, loading, error } = useFetch<User[]>('/users');
  
  return {
    users: data || [],
    loading,
    error,
  };
}

// Get user by ID
export function useUserById(id: string) {
  const { data, loading, error } = useFetch<User>(`/users/${id}`, [id]);
  
  return {
    user: data,
    loading,
    error,
  };
}

// Get current user
export function useCurrentUser() {
  const { data, loading, error } = useFetch<User>('/users/me');
  
  return {
    user: data,
    loading,
    error,
  };
}

// Create a new user
export async function createUser(user: Omit<User, 'id'>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(user),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error('Error creating user:', err);
    throw err;
  }
}

// Update an existing user
export async function updateUser(id: string, user: Partial<User>) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(user),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error updating user ${id}:`, err);
    throw err;
  }
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error deleting user ${id}:`, err);
    throw err;
  }
}

// ==================== TASK DEPENDENCIES API ====================

// Get dependencies for a task
export function useTaskDependencies(taskId: string) {
  const { data, loading, error } = useFetch<{
    id: string;
    task_id: string;
    depends_on_task_id: string;
    depends_on_task: {
      name: string;
      status: string;
    };
  }[]>(`/tasks/${taskId}/dependencies`, [taskId]);
  
  return {
    dependencies: data || [],
    loading,
    error,
  };
}

// Add a dependency to a task
export async function addDependency(taskId: string, dependsOnTaskId: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/dependencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ depends_on_task_id: dependsOnTaskId }),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error('Error adding task dependency:', err);
    throw err;
  }
}

// Remove a dependency from a task
export async function removeDependency(dependencyId: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/task-dependencies/${dependencyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error(`Error removing task dependency ${dependencyId}:`, err);
    throw err;
  }
}

// ==================== PROJECT ANALYTICS API ====================

// Get analytics for a project
export function useProjectAnalytics(projectId: string) {
  const { data, loading, error } = useFetch<{
    metrics: {
      total_hours: number;
      billable_hours: number;
      completion_percentage: number;
      task_completion_rate: number;
    };
    timeData: {
      date: string;
      hours: number;
      billableHours: number;
    }[];
    taskData: {
      date: string;
      completed: number;
      inProgress: number;
    }[];
  }>(`/projects/${projectId}/analytics`, [projectId]);
  
  return {
    metrics: data?.metrics || {
      total_hours: 0,
      billable_hours: 0,
      completion_percentage: 0,
      task_completion_rate: 0,
    },
    timeData: data?.timeData || [],
    taskData: data?.taskData || [],
    loading,
    error,
  };
}

// ==================== DASHBOARD STATS API ====================

// Get dashboard statistics
export function useStats() {
  const { data, loading, error } = useFetch<{
    weeklyHours: number;
    expectedWeeklyHours: number;
    monthlyHours: number;
    expectedMonthlyHours: number;
    upcomingDeadlines: Task[];
    completedProjects: (Project & { totalTasks: number; completedTasks: number; completedAt: string })[];
    projectProgress: {
      projectId: string;
      projectName: string;
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      blockedTasks: number;
      progress: number;
      status: string;
      budget?: number;
      spent?: number;
    }[];
    timeDistribution: {
      date: string;
      hours: number;
      billableHours: number;
      expected: number;
    }[];
    projectDistribution: {
      name: string;
      hours: number;
      percentage: number;
    }[];
    leaveBalances: {
      vacation: number;
      sick: number;
      personal: number;
    };
  }>('/stats');
  
  return {
    ...data,
    weeklyHours: data?.weeklyHours || 0,
    expectedWeeklyHours: data?.expectedWeeklyHours || 40,
    monthlyHours: data?.monthlyHours || 0,
    expectedMonthlyHours: data?.expectedMonthlyHours || 160,
    upcomingDeadlines: data?.upcomingDeadlines || [],
    completedProjects: data?.completedProjects || [],
    projectProgress: data?.projectProgress || [],
    timeDistribution: data?.timeDistribution || [],
    projectDistribution: data?.projectDistribution || [],
    leaveBalances: data?.leaveBalances || { vacation: 0, sick: 0, personal: 0 },
    loading,
    error,
  };
}

// ==================== AUTHENTICATION API ====================

// Login
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://api.tbrhub.com'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    
    // Store the JWT token
    localStorage.setItem('authToken', data.token);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (err: any) {
    console.error('Login error:', err);
    throw err;
  }
}

// Logout
export async function logout() {
  try {
    const token = localStorage.getItem('authToken');
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (err: any) {
    console.error('Logout error:', err);
    // Still clear local storage even if API call fails
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    throw err;
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        redirectTo: `${window.location.origin}${BASE_PATH}/update-password`
      }),
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error('Reset password error:', err);
    throw err;
  }
}

// Update password
export async function updatePassword(password: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
      credentials: 'include',
    });
    
    return await handleResponse(response);
  } catch (err: any) {
    console.error('Update password error:', err);
    throw err;
  }
}