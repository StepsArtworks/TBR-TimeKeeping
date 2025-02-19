import Dexie, { type Table } from 'dexie';
import { Project, Task, TimeEntry, LeaveRequest, User } from '../types';

export class TBRDatabase extends Dexie {
  users!: Table<User>;
  projects!: Table<Project>;
  tasks!: Table<Task>;
  timeEntries!: Table<TimeEntry>;
  leaveRequests!: Table<LeaveRequest>;
  taskDependencies!: Table<{
    id: string;
    task_id: string;
    depends_on_task_id: string;
    created_at: string;
    updated_at: string;
  }>;

  constructor() {
    super('tbr_timekeeper');
    
    // Reset database to version 1
    this.version(1).stores({
      users: '&id, email, role, department',
      projects: '&id, name, status, start_date, end_date',
      tasks: '&id, project_id, name, status, assigned_to, due_date',
      timeEntries: '&id, user_id, project_id, task_id, date, [user_id+date]',
      leaveRequests: '&id, user_id, status, start_date, end_date',
      taskDependencies: '&id, task_id, depends_on_task_id, [task_id+depends_on_task_id]'
    });

    // Add hooks for data validation
    this.users.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
      return obj;
    });

    this.users.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });

    this.projects.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
      return obj;
    });

    this.projects.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });

    this.tasks.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
      return obj;
    });

    this.tasks.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });

    this.timeEntries.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
      return obj;
    });

    this.timeEntries.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });

    this.leaveRequests.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
      return obj;
    });

    this.leaveRequests.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });
  }

  async initializeData() {
    try {
      // Delete existing database to avoid version conflicts
      await Dexie.delete('tbr_timekeeper');
      
      // Create new database
      const db = new TBRDatabase();
      await db.open();

      // Check if database is empty
      const userCount = await this.users.count();
      
      if (userCount === 0) {
        // Add default admin user
        await this.users.add({
          id: 'admin-user-id',
          email: 'admin@boilerroom.co.za',
          password: '1234TBRAdmin',
          full_name: 'System Admin',
          role: 'admin',
          department: 'IT',
          vacation_balance: 20,
          sick_balance: 10,
          personal_balance: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add default management user
        await this.users.add({
          id: 'd7bed21c-5699-4715-89b9-dd1d7654c937',
          email: 'management@boilerroom.co.za',
          password: '1234',
          full_name: 'Sarah Johnson',
          role: 'management',
          department: 'Management',
          vacation_balance: 20,
          sick_balance: 10,
          personal_balance: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add default lead user
        await this.users.add({
          id: 'e3e20f06-4f90-4e22-9e9d-82c9411c7fc5',
          email: 'lead@boilerroom.co.za',
          password: '1234',
          full_name: 'Michael Chen',
          role: 'lead',
          department: 'Engineering',
          vacation_balance: 15,
          sick_balance: 8,
          personal_balance: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add default regular users
        await this.users.add({
          id: 'f4a05c3d-1e7b-4091-a564-2dd9d1d2408f',
          email: 'user1@boilerroom.co.za',
          password: '1234',
          full_name: 'Alex Rodriguez',
          role: 'user',
          department: 'Engineering',
          vacation_balance: 12,
          sick_balance: 7,
          personal_balance: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await this.users.add({
          id: 'c2c7b238-459c-4ff5-a5f7-f3e8f8335c5d',
          email: 'user2@boilerroom.co.za',
          password: '1234',
          full_name: 'Emma Wilson',
          role: 'user',
          department: 'Design',
          vacation_balance: 10,
          sick_balance: 5,
          personal_balance: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add sample project
        const projectId = await this.projects.add({
          id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          name: 'Website Redesign',
          description: 'Complete overhaul of company website',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          budget: 50000,
          budget_spent: 15000,
          status: 'in_progress',
          created_by: 'd7bed21c-5699-4715-89b9-dd1d7654c937',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add sample task
        await this.tasks.add({
          id: 'task-001',
          project_id: projectId,
          name: 'Initial Planning',
          description: 'Define project scope and requirements',
          status: 'completed',
          start_date: '2024-01-01',
          due_date: '2024-01-15',
          estimated_hours: 20,
          actual_hours: 18,
          assigned_to: 'f4a05c3d-1e7b-4091-a564-2dd9d1d2408f',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add sample time entry
        await this.timeEntries.add({
          id: 'te-001',
          user_id: 'f4a05c3d-1e7b-4091-a564-2dd9d1d2408f',
          project_id: projectId,
          task_id: 'task-001',
          date: new Date().toISOString().split('T')[0],
          hours: 8,
          description: 'Project planning and requirements gathering',
          is_billable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add sample leave request
        await this.leaveRequests.add({
          id: 'lr-001',
          user_id: 'f4a05c3d-1e7b-4091-a564-2dd9d1d2408f',
          leave_type: 'vacation',
          status: 'pending',
          start_date: '2024-03-15',
          end_date: '2024-03-22',
          hours_per_day: 8,
          reason: 'Annual vacation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      throw err;
    }
  }
}

export const db = new TBRDatabase();

// Initialize the database with demo data
db.initializeData().catch(err => {
  console.error('Failed to initialize database:', err);
});