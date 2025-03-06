import React, { useEffect, useState } from 'react';
import { Project, Task, TimeEntry, User, LeaveRequest } from '../types';

const API_BASE_URL = 'https://api.tbrhub.com';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Projects API
export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Project[]>(response);
}

export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Project>(response);
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(project),
  });
  return handleResponse<Project>(response);
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(project),
  });
  return handleResponse<Project>(response);
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<void>(response);
}

// Tasks API
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Task[]>(response);
}

export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Task>(response);
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<void>(response);
}

// Task Dependencies API
export async function getTaskDependencies(taskId: string): Promise<{
  id: string;
  task_id: string;
  depends_on_task_id: string;
}[]> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/dependencies`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createTaskDependency(data: {
  task_id: string;
  depends_on_task_id: string;
}): Promise<{
  id: string;
  task_id: string;
  depends_on_task_id: string;
}> {
  const response = await fetch(`${API_BASE_URL}/task-dependencies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteTaskDependency(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/task-dependencies/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<void>(response);
}

// Time Entries API
export async function getTimeEntries(): Promise<TimeEntry[]> {
  const response = await fetch(`${API_BASE_URL}/time-entries`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<TimeEntry[]>(response);
}

export async function getTimeEntry(id: string): Promise<TimeEntry> {
  const response = await fetch(`${API_BASE_URL}/time-entries/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<TimeEntry>(response);
}

export async function createTimeEntry(entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>): Promise<TimeEntry> {
  const response = await fetch(`${API_BASE_URL}/time-entries`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(entry),
  });
  return handleResponse<TimeEntry>(response);
}

export async function updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry> {
  const response = await fetch(`${API_BASE_URL}/time-entries/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(entry),
  });
  return handleResponse<TimeEntry>(response);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/time-entries/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<void>(response);
}

// Users API
export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<User[]>(response);
}

export async function getUser(id: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<User>(response);
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
  return handleResponse<User>(response);
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
  return handleResponse<User>(response);
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<void>(response);
}

// Leave Requests API
export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  const response = await fetch(`${API_BASE_URL}/leave-requests`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<LeaveRequest[]>(response);
}

export async function getLeaveRequest(id: string): Promise<LeaveRequest> {
  const response = await fetch(`${API_BASE_URL}/leave-requests/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<LeaveRequest>(response);
}

export async function createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>): Promise<LeaveRequest> {
  const response = await fetch(`${API_BASE_URL}/leave-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse<LeaveRequest>(response);
}

export async function updateLeaveRequest(id: string, request: Partial<LeaveRequest>): Promise<LeaveRequest> {
  const response = await fetch(`${API_BASE_URL}/leave-requests/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse<LeaveRequest>(response);
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/leave-requests/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse<void>(response);
}

// Authentication API
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ token: string; user: User }>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  await handleResponse<void>(response);
}

// Project Analytics API
export async function getProjectAnalytics(projectId: string): Promise<{
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
}> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/analytics`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Custom Hooks
export function useUserById(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        setLoading(true);
        const userData = await getUser(userId);
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading, error };
}

export function useTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEntries() {
      try {
        setLoading(true);
        const data = await getTimeEntries();
        setEntries(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching time entries:', err);
        setError('Failed to load time entries');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, []);

  return { entries, loading, error };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        const data = await getTasks();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  return { tasks, loading, error };
}

// Add this to the existing api.ts file, after the other API functions

export async function resetPassword(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  await handleResponse<void>(response);
}