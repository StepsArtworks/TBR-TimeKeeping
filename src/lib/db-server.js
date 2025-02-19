import Database from 'better-sqlite3';
import { config } from '../../config.js';

// Initialize database
const db = new Database(config.dbPath, {
  verbose: console.log
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Rest of the file remains the same...

export { db }