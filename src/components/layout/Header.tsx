import React from 'react';
import { Bell, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed left-0 right-0 top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 dark:border-dark-700 dark:bg-dark-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-primary">TBR Time Keeping</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-700"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-700">
          <Bell className="h-5 w-5" />
        </button>

        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-700">
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}