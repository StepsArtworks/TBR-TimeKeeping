export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'management' | 'lead' | 'user';
  department: string;
  vacation_balance: number;
  sick_balance: number;
  personal_balance: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  budget: number;
  budget_spent: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  start_date: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  assigned_to: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  task_id: string;
  date: string;
  hours: number;
  description: string;
  is_billable: boolean;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: 'vacation' | 'sick' | 'personal';
  status: 'pending' | 'approved' | 'rejected';
  start_date: string;
  end_date: string;
  hours_per_day: number;
  reason: string;
  approved_by?: string;
  approved_at?: string;
}

export interface UserInvite {
  id: string;
  email: string;
  role: User['role'];
  department: string;
  invited_by: string;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}