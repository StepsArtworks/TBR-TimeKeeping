import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FolderOpen,
  Home,
  Settings,
  Users,
  CheckSquare,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', to: '/', icon: Home },
  { name: 'Time Entries', to: '/time-entries', icon: Clock },
  { name: 'Leave Requests', to: '/leave-requests', icon: Calendar },
  { name: 'Leave Approvals', to: '/leave-approvals', icon: CheckSquare },
  { name: 'Projects', to: '/projects', icon: FolderOpen },
  { name: 'Tasks', to: '/tasks', icon: ClipboardList },
  { name: 'Team', to: '/team', icon: Users },
  { name: 'Reports', to: '/reports', icon: BarChart3 },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-white transition-all duration-300 dark:bg-dark-800',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <span className="text-xl font-bold text-primary">TBR Time</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-dark-700"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                'hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-dark-700',
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-dark-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300'
              )
            }
          >
            <item.icon
              className={cn('h-5 w-5', collapsed ? 'mx-auto' : 'mr-3')}
            />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}