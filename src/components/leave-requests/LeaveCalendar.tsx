import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LeaveCalendarProps {
  requests: any[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function LeaveCalendar({
  requests,
  currentDate,
  onDateChange,
}: LeaveCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getRequestsForDay = (date: Date) =>
    requests.filter(
      (request) =>
        new Date(request.start_date) <= date && new Date(request.end_date) >= date
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
            }
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-dark-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() =>
              onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
            }
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-dark-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dayRequests = getRequestsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] rounded-lg border p-2 ${
                !isSameMonth(day, currentDate)
                  ? 'bg-gray-50 dark:bg-dark-900/50'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-700'
              } ${
                isToday(day)
                  ? 'border-primary-500 dark:border-primary-400'
                  : 'border-gray-200 dark:border-dark-700'
              }`}
            >
              <div className="text-right text-sm">
                {format(day, 'd')}
              </div>
              <div className="mt-1 space-y-1">
                {dayRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded bg-gray-100 p-1 text-xs dark:bg-dark-700"
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${getStatusColor(
                          request.status
                        )}`}
                      />
                      <span className="truncate">
                        {request.leave_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}