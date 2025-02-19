import Dexie from 'dexie';

// Define the database
const db = new Dexie('tbr_timekeeper');

// Configure database tables
db.version(1).stores({
  users: '&id, email, role, department',
  projects: '&id, name, status, start_date, end_date',
  tasks: '&id, project_id, name, status, assigned_to, due_date',
  timeEntries: '&id, user_id, project_id, task_id, date, [user_id+date]',
  leaveRequests: '&id, user_id, status, start_date, end_date',
  taskDependencies: '&id, task_id, depends_on_task_id, [task_id+depends_on_task_id]'
});

async function initializeDatabase() {
  try {
    // Clear existing data
    await db.delete();
    await db.open();

    // Initialize with demo data
    await db.transaction('rw', [db.users, db.projects, db.tasks, db.timeEntries, db.leaveRequests], async () => {
      console.log('Adding demo users...');
      await db.users.bulkAdd([
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
      ]);

      console.log('Adding demo projects...');
      const projectId = await db.projects.add({
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

      console.log('Adding demo tasks...');
      const taskId = await db.tasks.add({
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

      console.log('Adding demo time entries...');
      await db.timeEntries.add({
        id: 'te-001',
        user_id: 'f4a05c3d-1e7b-4091-a564-2dd9d1d2408f',
        project_id: projectId,
        task_id: taskId,
        date: new Date().toISOString().split('T')[0],
        hours: 8,
        description: 'Project planning and requirements gathering',
        is_billable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      console.log('Adding demo leave requests...');
      await db.leaveRequests.add({
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
    });

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();