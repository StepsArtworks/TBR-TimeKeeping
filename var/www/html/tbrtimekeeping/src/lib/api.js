import { db } from './db-server.js';
import { randomUUID } from 'crypto';

// Helper function to log errors
const logError = (error, req, statusCode) => {
  try {
    const errorId = randomUUID();
    db.prepare(`
      INSERT INTO error_logs (
        id, error_type, message, stack_trace, user_id, 
        request_path, request_method, request_body, status_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      errorId,
      error.name,
      error.message,
      error.stack,
      req.user?.id,
      req.path,
      req.method,
      JSON.stringify(req.body),
      statusCode
    );
    return errorId;
  } catch (err) {
    console.error('Failed to log error:', err);
    return null;
  }
};

export const api = {
  // User operations
  async login(email, password) {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }
    return user;
  },

  async createUser(data) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO users (
        id, email, password, full_name, role, department,
        vacation_balance, sick_balance, personal_balance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.email,
      data.password,
      data.full_name,
      data.role,
      data.department,
      20, // Default vacation balance
      10, // Default sick balance
      5   // Default personal balance
    );
    return { id, ...data };
  },

  // Project operations
  async getProjects() {
    return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  },

  async createProject(data) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO projects (
        id, name, description, start_date, end_date,
        budget, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      data.description,
      data.start_date,
      data.end_date,
      data.budget,
      data.status || 'not_started',
      data.created_by
    );
    return { id, ...data };
  },

  // Task operations
  async getProjectTasks(projectId) {
    return db.prepare('SELECT * FROM tasks WHERE project_id = ?').all(projectId);
  },

  async getUserTasks(userId) {
    return db.prepare('SELECT * FROM tasks WHERE assigned_to = ?').all(userId);
  },

  // Time entry operations
  async getUserTimeEntries(userId) {
    return db.prepare(`
      SELECT t.*, p.name as project_name, tk.name as task_name
      FROM time_entries t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN tasks tk ON t.task_id = tk.id
      WHERE t.user_id = ?
      ORDER BY t.date DESC
    `).all(userId);
  },

  async createTimeEntry(data) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO time_entries (
        id, user_id, project_id, task_id, date,
        hours, description, is_billable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.user_id,
      data.project_id,
      data.task_id,
      data.date,
      data.hours,
      data.description,
      data.is_billable ? 1 : 0
    );
    return { id, ...data };
  },

  // Leave request operations
  async getUserLeaveRequests(userId) {
    return db.prepare('SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  async getDepartmentLeaveRequests(department) {
    return db.prepare(`
      SELECT lr.*, u.full_name, u.department
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE u.department = ?
      ORDER BY lr.created_at DESC
    `).all(department);
  },

  async createLeaveRequest(data) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO leave_requests (
        id, user_id, leave_type, status, start_date,
        end_date, hours_per_day, reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.user_id,
      data.leave_type,
      'pending',
      data.start_date,
      data.end_date,
      data.hours_per_day,
      data.reason
    );
    return { id, ...data, status: 'pending' };
  },

  // Error log methods
  async getErrorLogs(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return db.prepare(`
      SELECT e.*, u.full_name as user_name
      FROM error_logs e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  },

  async getErrorLogsByType(errorType, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return db.prepare(`
      SELECT e.*, u.full_name as user_name
      FROM error_logs e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.error_type = ?
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `).all(errorType, limit, offset);
  },

  logError
};