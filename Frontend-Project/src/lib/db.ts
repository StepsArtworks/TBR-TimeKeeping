import Dexie, { Table } from 'dexie';
import { User, Project, Task, TimeEntry, LeaveRequest } from '../types';

// Create a Dexie database
export class AppDatabase extends Dexie {
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
    super('tbrTimeKeepingDB');
    
    // Define tables and indexes
    this.version(1).stores({
      users: 'id, email, role, department',
      projects: 'id, name, status, created_by',
      tasks: 'id, project_id, status, assigned_to',
      timeEntries: 'id, user_id, project_id, task_id, date',
      leaveRequests: 'id, user_id, leave_type, status',
      taskDependencies: 'id, task_id, depends_on_task_id',
    });
  }
}

export const db = new AppDatabase();

// Initialize with some demo data
export async function initializeDatabase() {
  const usersCount = await db.users.count();
  
  if (usersCount === 0) {
    // Add demo users
    await db.users.bulkAdd([
      {
        id: '1',
        email: 'admin@example.com',
        password: 'password',
        full_name: 'Admin User',
        role: 'admin',
        department: 'Administration',
        vacation_balance: 20,
        sick_balance: 10,
        personal_balance: 5
      },
      {
        id: '2',
        email: 'manager@example.com',
        password: 'password',
        full_name: 'Manager User',
        role: 'management',
        department: 'Management',
        vacation_balance: 20,
        sick_balance: 10,
        personal_balance: 5
      },
      {
        id: '3',
        email: 'lead@example.com',
        password: 'password',
        full_name: 'Team Lead',
        role: 'lead',
        department: 'Engineering',
        vacation_balance: 20,
        sick_balance: 10,
        personal_balance: 5
      },
      {
        id: '4',
        email: 'user@example.com',
        password: 'password',
        full_name: 'Regular User',
        role: 'user',
        department: 'Engineering',
        vacation_balance: 20,
        sick_balance: 10,
        personal_balance: 5
      }
    ]);

    // Add demo projects
    await db.projects.bulkAdd([
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Redesign the company website with modern UI/UX',
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        budget: 50000,
        budget_spent: 15000,
        status: 'in_progress',
        created_by: '2',
        created_at: '2024-12-15T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'Develop a mobile app for iOS and Android',
        start_date: '2025-02-01',
        end_date: '2025-06-30',
        budget: 80000,
        budget_spent: 20000,
        status: 'in_progress',
        created_by: '2',
        created_at: '2025-01-15T00:00:00Z',
        updated_at: '2025-02-01T00:00:00Z'
      }
    ]);

    // Add demo tasks
    await db.tasks.bulkAdd([
      {
        id: '1',
        project_id: '1',
        name: 'Design Homepage',
        description: 'Create wireframes and design for the homepage',
        status: 'completed',
        start_date: '2025-01-05',
        due_date: '2025-01-15',
        estimated_hours: 20,
        actual_hours: 18,
        assigned_to: '4'
      },
      {
        id: '2',
        project_id: '1',
        name: 'Implement Homepage',
        description: 'Develop the homepage based on the approved design',
        status: 'in_progress',
        start_date: '2025-01-16',
        due_date: '2025-01-31',
        estimated_hours: 40,
        actual_hours: 20,
        assigned_to: '4'
      },
      {
        id: '3',
        project_id: '2',
        name: 'App Architecture',
        description: 'Design the architecture for the mobile app',
        status: 'completed',
        start_date: '2025-02-01',
        due_date: '2025-02-15',
        estimated_hours: 30,
        actual_hours: 32,
        assigned_to: '3'
      }
    ]);

    // Add demo time entries
    await db.timeEntries.bulkAdd([
      {
        id: '1',
        user_id: '4',
        project_id: '1',
        task_id: '1',
        date: '2025-01-10',
        hours: 8,
        description: 'Working on homepage wireframes',
        is_billable: true
      },
      {
        id: '2',
        user_id: '4',
        project_id: '1',
        task_id: '1',
        date: '2025-01-11',
        hours: 6,
        description: 'Finalizing homepage design',
        is_billable: true
      },
      {
        id: '3',
        user_id: '4',
        project_id: '1',
        task_id: '2',
        date: '2025-01-20',
        hours: 8,
        description: 'Started implementing homepage',
        is_billable: true
      }
    ]);

    // Add demo leave requests
    await db.leaveRequests.bulkAdd([
      {
        id: '1',
        user_id: '4',
        leave_type: 'vacation',
        status: 'approved',
        start_date: '2025-02-10',
        end_date: '2025-02-14',
        hours_per_day: 8,
        reason: 'Family vacation',
        approved_by: '3',
        approved_at: '2025-01-20T00:00:00Z'
      },
      {
        id: '2',
        user_id: '3',
        leave_type: 'sick',
        status: 'approved',
        start_date: '2025-01-05',
        end_date: '2025-01-06',
        hours_per_day: 8,
        reason: 'Not feeling well',
        approved_by: '2',
        approved_at: '2025-01-04T00:00:00Z'
      }
    ]);
  }
}