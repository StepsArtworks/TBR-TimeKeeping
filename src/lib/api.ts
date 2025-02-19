import { db, statements } from './db-server';
import { randomUUID } from 'crypto';

// Helper function to log errors
const logError = (error: Error, req: any, statusCode: number) => {
  try {
    const errorId = randomUUID();
    statements.logError.run(
      errorId,
      error.name,
      error.message,
      error.stack,
      req.user?.id, // User ID if authenticated
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
  async login(email: string, password: string) {
    const user = statements.getUserByEmail.get(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }
    return user;
  },

  async createUser(data: any) {
    const id = randomUUID();
    statements.createUser.run(
      id,
      data.email,
      data.password,
      data.full_name,
      data.role,
      data.department
    );
    return { id, ...data };
  },

  // Project operations
  async getProjects() {
    return statements.getProjects.all();
  },

  async createProject(data: any) {
    const id = randomUUID();
    statements.createProject.run(
      id,
      data.name,
      data.description,
      data.start_date,
      data.end_date,
      data.budget,
      data.status,
      data.created_by
    );
    return { id, ...data };
  },

  // Task operations
  async getProjectTasks(projectId: string) {
    return statements.getProjectTasks.all(projectId);
  },

  async getUserTasks(userId: string) {
    return statements.getUserTasks.all(userId);
  },

  // Time entry operations
  async getUserTimeEntries(userId: string) {
    return statements.getUserTimeEntries.all(userId);
  },

  async createTimeEntry(data: any) {
    const id = randomUUID();
    statements.createTimeEntry.run(
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
  async getUserLeaveRequests(userId: string) {
    return statements.getUserLeaveRequests.all(userId);
  },

  async getDepartmentLeaveRequests(department: string) {
    return statements.getDepartmentLeaveRequests.all(department);
  },

  async createLeaveRequest(data: any) {
    const id = randomUUID();
    statements.createLeaveRequest.run(
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
    return statements.getErrorLogs.all(limit, offset);
  },

  async getErrorLogsByType(errorType: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return statements.getErrorLogsByType.all(errorType, limit, offset);
  },

  logError
};