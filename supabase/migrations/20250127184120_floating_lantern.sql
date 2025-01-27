/*
  # Add task dependencies and project analytics

  1. New Tables
    - `task_dependencies`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `depends_on_task_id` (uuid, references tasks)
      - `created_at` (timestamp)
    
    - `project_metrics`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `total_hours` (float)
      - `billable_hours` (float)
      - `completion_percentage` (float)
      - `task_completion_rate` (float)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create task dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Create project metrics table
CREATE TABLE IF NOT EXISTS project_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  total_hours float DEFAULT 0,
  billable_hours float DEFAULT 0,
  completion_percentage float DEFAULT 0,
  task_completion_rate float DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for task dependencies
CREATE POLICY "Users can view task dependencies"
  ON task_dependencies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_dependencies.task_id
      AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Management can manage task dependencies"
  ON task_dependencies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

-- Policies for project metrics
CREATE POLICY "Users can view project metrics"
  ON project_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE project_id = project_metrics.project_id
      AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Management can manage project metrics"
  ON project_metrics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

-- Create function to update project metrics
CREATE OR REPLACE FUNCTION update_project_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update project metrics
  INSERT INTO project_metrics (project_id)
  VALUES (NEW.project_id)
  ON CONFLICT (project_id) DO UPDATE
  SET
    total_hours = (
      SELECT COALESCE(SUM(hours), 0)
      FROM time_entries
      WHERE project_id = NEW.project_id
    ),
    billable_hours = (
      SELECT COALESCE(SUM(hours), 0)
      FROM time_entries
      WHERE project_id = NEW.project_id
      AND is_billable = true
    ),
    completion_percentage = (
      SELECT COALESCE(
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / 
        NULLIF(COUNT(*)::float, 0) * 100,
        0
      )
      FROM tasks
      WHERE project_id = NEW.project_id
    ),
    task_completion_rate = (
      SELECT COALESCE(
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / 
        NULLIF(EXTRACT(EPOCH FROM (now() - MIN(created_at))) / 86400, 0),
        0
      )
      FROM tasks
      WHERE project_id = NEW.project_id
    ),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update project metrics
CREATE TRIGGER update_project_metrics_on_time_entry
  AFTER INSERT OR UPDATE OR DELETE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_project_metrics();

CREATE TRIGGER update_project_metrics_on_task
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_metrics();