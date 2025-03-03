import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AuthProvider } from './components/AuthProvider';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TimeEntries } from './pages/TimeEntries';
import { LeaveManagement } from './pages/LeaveManagement';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { Tasks } from './pages/Tasks';
import { Team } from './pages/Team';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { UserManagement } from './pages/UserManagement';
import { useAuth } from './components/AuthProvider';

// Get the base path from the Vite config or default to '/tbrtimekeeping'
const BASE_PATH = '/tbrtimekeeping';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`${BASE_PATH}/login`} />;
  }

  // Redirect admin users to user management
  if (user.role === 'admin' && window.location.pathname !== `${BASE_PATH}/users`) {
    return <Navigate to={`${BASE_PATH}/users`} />;
  }

  // Prevent non-admin users from accessing user management
  if (user.role !== 'admin' && window.location.pathname === `${BASE_PATH}/users`) {
    return <Navigate to={`${BASE_PATH}/`} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar basePath={BASE_PATH} />
      <div className="flex-1">
        <Header />
        <main className="mt-16 p-6">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename={BASE_PATH}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/time-entries"
            element={
              <PrivateRoute>
                <TimeEntries />
              </PrivateRoute>
            }
          />
          <Route
            path="/leave"
            element={
              <PrivateRoute>
                <LeaveManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <PrivateRoute>
                <ProjectDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            }
          />
          <Route
            path="/team"
            element={
              <PrivateRoute>
                <Team />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;