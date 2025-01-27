/*
  # Initial Schema for TBR Time Keeping

  1. New Tables
    - `users`
      - Core user information and role
    - `projects`
      - Project details and budget information
    - `tasks`
      - Project tasks with assignments and deadlines
    - `time_entries`
      - Time tracking records
    - `leave_requests`
      - Leave management
    - `templates`
      - Project templates
    - `audit_logs`
      - System audit trail
    - `notifications`
      - User notifications

  2. Security
    - Enable RLS on all tables
    - Policies for Management, Lead, and User roles
    - Secure data access based on user role and ownership

  3. Relationships
    - Users to Projects (many-to-many through assignments)
    - Projects to Tasks (one-to-many)
    - Users to Time Entries (one-to-many)
    - Users to Leave Requests (one-to-many)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('management', 'lead', 'user');

-- Leave types enum
CREATE TYPE leave_type AS ENUM ('vacation', 'sick', 'personal', 'unpaid');

-- Leave status enum
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Task status enum
CREATE TYPE task_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked');

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true,
  vacation_balance float DEFAULT 0,
  sick_balance float DEFAULT 0,
  personal_balance float DEFAULT 0
);

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  budget decimal(12,2),
  budget_spent decimal(12,2) DEFAULT 0,
  status task_status DEFAULT 'not_started',
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_template boolean DEFAULT false,
  is_archived boolean DEFAULT false
);

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status task_status DEFAULT 'not_started',
  start_date timestamptz,
  due_date timestamptz,
  estimated_hours float,
  actual_hours float DEFAULT 0,
  assigned_to uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  priority integer DEFAULT 1
);

-- Create time_entries table
CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  task_id uuid REFERENCES tasks(id),
  project_id uuid REFERENCES projects(id),
  date date NOT NULL,
  hours float NOT NULL,
  description text,
  is_billable boolean DEFAULT true,
  is_approved boolean DEFAULT false,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leave_requests table
CREATE TABLE leave_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  leave_type leave_type NOT NULL,
  status leave_status DEFAULT 'pending',
  start_date date NOT NULL,
  end_date date NOT NULL,
  hours_per_day float DEFAULT 8,
  reason text,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  type text NOT NULL,
  link text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Management can view all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

CREATE POLICY "Leads can view their department users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'lead' 
      AND u.department = users.department
    )
  );

-- Create policies for projects table
CREATE POLICY "Users can view assigned projects"
  ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE project_id = projects.id
      AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Management can manage all projects"
  ON projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

CREATE POLICY "Leads can manage their projects"
  ON projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'lead'
    )
  );

-- Create policies for tasks table
CREATE POLICY "Users can view and update assigned tasks"
  ON tasks
  FOR ALL
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Management can manage all tasks"
  ON tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

CREATE POLICY "Leads can manage department tasks"
  ON tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'lead'
      AND u.department = (
        SELECT department FROM users WHERE id = tasks.assigned_to
      )
    )
  );

-- Create policies for time_entries table
CREATE POLICY "Users can manage their time entries"
  ON time_entries
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Management can view all time entries"
  ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

CREATE POLICY "Leads can view department time entries"
  ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'lead'
      AND u.department = (
        SELECT department FROM users WHERE id = time_entries.user_id
      )
    )
  );

-- Create policies for leave_requests table
CREATE POLICY "Users can manage their leave requests"
  ON leave_requests
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Management can manage all leave requests"
  ON leave_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

CREATE POLICY "Leads can manage department leave requests"
  ON leave_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'lead'
      AND u.department = (
        SELECT department FROM users WHERE id = leave_requests.user_id
      )
    )
  );

-- Create policies for notifications table
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policies for audit_logs table
CREATE POLICY "Management can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();