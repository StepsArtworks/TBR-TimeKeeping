import { db } from './src/lib/db-server.js';
import { randomUUID } from 'crypto';

async function initializeDatabase() {
  try {
    // Create admin user
    const adminId = randomUUID();
    db.prepare(`
      INSERT INTO users (
        id, email, password, full_name, role, department,
        vacation_balance, sick_balance, personal_balance,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      adminId,
      'admin@boilerroom.co.za',
      '1234TBRAdmin',
      'System Admin',
      'admin',
      'IT',
      20,
      10,
      5
    );

    console.log('Admin user created successfully!');
    console.log('Email: admin@boilerroom.co.za');
    console.log('Password: 1234TBRAdmin');

  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('Admin user already exists');
    } else {
      console.error('Error initializing database:', error);
    }
  }
}

initializeDatabase();