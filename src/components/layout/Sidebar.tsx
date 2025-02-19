import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users } from 'lucide-react';
import { useAuth } from '../AuthProvider';

export function Sidebar() {
  const { user } = useAuth();

  // Show different navigation items based on user role
  const navigation = user?.role === 'admin'
    ? [
        { name: 'User Management', to: '/users', icon: Users },
      ]
    : [
        { name: 'Dashboard', to: '/', icon: Home },
        // Add other navigation items for non-admin users here
      ];

  return (
    <nav className="w-64 bg-white p-4 dark:bg-dark-800">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary">TBR Time Keeping</h1>
      </div>
      <div className="space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-dark-700 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-dark-700'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}