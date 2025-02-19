import Database from 'better-sqlite3';
import { config } from '../../config.js';

// Initialize database
const db = new Database(config.dbPath, {
  verbose: console.log
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'management', 'lead', 'user')),
    department TEXT NOT NULL,
    vacation_balance REAL DEFAULT 0,
    sick_balance REAL DEFAULT 0,
    personal_balance REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    budget REAL,
    budget_spent REAL DEFAULT 0,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    start_date TEXT,
    due_date TEXT,
    estimated_hours REAL,
    actual_hours REAL DEFAULT 0,
    assigned_to TEXT REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS time_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    project_id TEXT REFERENCES projects(id),
    task_id TEXT REFERENCES tasks(id),
    date TEXT NOT NULL,
    hours REAL NOT NULL,
    description TEXT,
    is_billable INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    leave_type TEXT CHECK(leave_type IN ('vacation', 'sick', 'personal')),
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    hours_per_day REAL DEFAULT 8,
    reason TEXT,
    approved_by TEXT REFERENCES users(id),
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS task_dependencies (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, depends_on_task_id)
  );
  
  CREATE TABLE IF NOT EXISTS error_logs (
    id TEXT PRIMARY KEY,
    error_type TEXT NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    user_id TEXT,
    request_path TEXT,
    request_method TEXT,
    request_body TEXT,
    status_code INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
  CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
  CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
  CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
`);

export { db };