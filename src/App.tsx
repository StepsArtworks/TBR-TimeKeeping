import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { TimeEntries } from './pages/TimeEntries';
import { LeaveRequests } from './pages/LeaveRequests';
import { LeaveApprovals } from './pages/LeaveApprovals';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="mt-16 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/time-entries" element={<TimeEntries />} />
              <Route path="/leave-requests" element={<LeaveRequests />} />
              <Route path="/leave-approvals" element={<LeaveApprovals />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App