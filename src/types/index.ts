export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'management' | 'lead' | 'user';
  department: string;
  vacation_balance: number;
  sick_balance: number;
  personal_balance: number;
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
  is_approved: boolean;
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
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
}