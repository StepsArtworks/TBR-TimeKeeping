import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { db, statements } from './src/lib/db-server.js';
import { api } from './src/lib/api.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error to database
  const errorId = api.logError(err, req, 500);

  // Send error response
  res.status(500).json({
    error: 'An error occurred',
    errorId,
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Add error handling to all routes
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    const errorId = api.logError(err, req, err.status || 500);
    res.status(err.status || 500).json({
      error: err.message || 'An error occurred',
      errorId
    });
  });

// User routes
app.post(`${config.apiBasePath}/login`, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await api.login(email, password);
  res.json(user);
}));

// Project routes
app.get(`${config.apiBasePath}/projects`, asyncHandler(async (req, res) => {
  const projects = await api.getProjects();
  res.json(projects);
}));

app.post(`${config.apiBasePath}/projects`, asyncHandler(async (req, res) => {
  const project = await api.createProject(req.body);
  res.json(project);
}));

// Task routes
app.get(`${config.apiBasePath}/projects/:projectId/tasks`, asyncHandler(async (req, res) => {
  const tasks = await api.getProjectTasks(req.params.projectId);
  res.json(tasks);
}));

app.get(`${config.apiBasePath}/users/:userId/tasks`, asyncHandler(async (req, res) => {
  const tasks = await api.getUserTasks(req.params.userId);
  res.json(tasks);
}));

// Time entry routes
app.get(`${config.apiBasePath}/users/:userId/time-entries`, asyncHandler(async (req, res) => {
  const entries = await api.getUserTimeEntries(req.params.userId);
  res.json(entries);
}));

app.post(`${config.apiBasePath}/time-entries`, asyncHandler(async (req, res) => {
  const entry = await api.createTimeEntry(req.body);
  res.json(entry);
}));

// Leave request routes
app.get(`${config.apiBasePath}/users/:userId/leave-requests`, asyncHandler(async (req, res) => {
  const requests = await api.getUserLeaveRequests(req.params.userId);
  res.json(requests);
}));

app.get(`${config.apiBasePath}/departments/:department/leave-requests`, asyncHandler(async (req, res) => {
  const requests = await api.getDepartmentLeaveRequests(req.params.department);
  res.json(requests);
}));

app.post(`${config.apiBasePath}/leave-requests`, asyncHandler(async (req, res) => {
  const request = await api.createLeaveRequest(req.body);
  res.json(request);
}));

// Error log routes (admin only)
app.get(`${config.apiBasePath}/error-logs`, asyncHandler(async (req, res) => {
  // Check if user is admin
  if (!req.user || req.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const { page, limit, type } = req.query;
  const logs = type
    ? await api.getErrorLogsByType(type, parseInt(page), parseInt(limit))
    : await api.getErrorLogs(parseInt(page), parseInt(limit));
  res.json(logs);
}));

// Use error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
  console.log(`Using database at: ${config.dbPath}`);
});

// Handle cleanup on shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit();
});