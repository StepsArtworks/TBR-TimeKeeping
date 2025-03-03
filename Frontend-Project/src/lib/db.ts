import { Project, Task, TimeEntry, LeaveRequest, User, UserInvite } from '../types';

interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  created_at: string;
  updated_at: string;
}

export class TBRDatabase extends Dexie {
  projects!: Table<Project>;
  tasks!: Table<Task>;
  timeEntries!: Table<TimeEntry>;
  leaveRequests!: Table<LeaveRequest>;
  users!: Table<User>;
  taskDependencies!: Table<TaskDependency>;
  userInvites!: Table<UserInvite>;

  constructor() {
    super('tbr_timekeeper');

    this.version(4).stores({
      projects: '&id, name, status, start_date, end_date',
      tasks: '&id, project_id, name, status, assigned_to, due_date',
      timeEntries: '&id, user_id, project_id, task_id, date, [user_id+date]',
      leaveRequests: '&id, user_id, status, start_date, end_date',
      users: '&id, email, role, department',
      taskDependencies: '&id, task_id, depends_on_task_id, [task_id+depends_on_task_id]',
      userInvites: '&id, email, token, expires_at'
    });

    // Add hooks for data validation
    this.projects.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
    });

    this.projects.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });

    this.tasks.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
    });

    this.tasks.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });

    this.taskDependencies.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
    });

    this.taskDependencies.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });

    this.timeEntries.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
    });

    this.timeEntries.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });

    this.userInvites.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
    });

    this.userInvites.hook('updating', (mods) => {
      return { ...mods, updated_at: new Date().toISOString() };
    });
  }

  async initializeData() {
    const projectCount = await this.projects.count();
    if (projectCount === 0) {
      // Import initial data from mockData
      const { projects, tasks, timeEntries, leaveRequests, users } = await import('./mockData');

      await this.transaction('rw',
        [this.projects, this.tasks, this.timeEntries, this.leaveRequests, this.users],
        async () => {
          await this.projects.bulkAdd(projects);
          await this.tasks.bulkAdd(tasks);
          await this.timeEntries.bulkAdd(timeEntries);
          await this.leaveRequests.bulkAdd(leaveRequests);
          await this.users.bulkAdd(users);
        }
      );
    }
  }
}

export const db = new TBRDatabase();

// Initialize the database with mock data
db.initializeData().catch(err => {
  console.error('Failed to initialize database:', err);
});