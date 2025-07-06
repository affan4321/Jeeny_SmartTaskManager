"use client";

import { useState, useEffect, useCallback, useRef } from "react";
// import { createClient } from "@/lib/supabase/client"; // Commented out as not currently used

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline: string | null;
  reminder: string | null; // Changed from reminder_minutes_before to reminder (time field)
  created_at: string;
  category_id?: string | null;
  updated_at?: string;
  categories?: {
    id: string;
    name: string;
  } | null;
}

interface ReminderNotification {
  id: string;
  taskId: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface ReminderBellProps {
  tasks: Task[];
}

export function ReminderBell({ tasks }: ReminderBellProps) {
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [remindedTasks, setRemindedTasks] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date()); // Add currentTime state for real-time updates
  
  // Use refs to avoid stale closures
  const notificationsRef = useRef<ReminderNotification[]>([]);
  const remindedTasksRef = useRef<Set<string>>(new Set());
  
  // Update refs when state changes
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  
  useEffect(() => {
    remindedTasksRef.current = remindedTasks;
  }, [remindedTasks]);

  // Update current time every 10 seconds for real-time display updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Check for upcoming reminders
  const checkReminders = useCallback(() => {
    const newNotifications: ReminderNotification[] = [];
    
    // Process each task and check if it needs a reminder
    tasks.forEach(task => {
      if (task.reminder && !task.completed) {
        const reminderTime = new Date(task.reminder);
        
        // Check if the current time has passed the reminder time
        if (currentTime >= reminderTime) {
          // Check if we already have a notification for this task OR if we've already reminded about it
          const existingNotification = notificationsRef.current.find(n => n.taskId === task.id);
          const alreadyReminded = remindedTasksRef.current.has(task.id);
          
          if (!existingNotification && !alreadyReminded) {
            const message = task.deadline 
              ? `Reminder: "${task.title}" - scheduled for ${new Date(task.deadline).toLocaleString()}`
              : `Reminder: "${task.title}"`;
            
            newNotifications.push({
              id: `${task.id}-${Date.now()}`,
              taskId: task.id,
              title: task.title,
              message,
              timestamp: new Date(currentTime),
              isRead: false
            });
          }
        }
      }
    });

    if (newNotifications.length > 0) {
      // Update notifications
      setNotifications(prev => [...prev, ...newNotifications]);
      
      // Update reminded tasks
      setRemindedTasks(prev => {
        const newSet = new Set(prev);
        newNotifications.forEach(notification => {
          newSet.add(notification.taskId);
        });
        return newSet;
      });
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        newNotifications.forEach(notification => {
          new Notification(`Task Reminder: ${notification.title}`, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        });
      }
    }
  }, [tasks, currentTime]); // Add currentTime to dependencies

  // Clean up reminded tasks when tasks are completed, deleted, or reminder time has passed
  useEffect(() => {
    setRemindedTasks(prev => {
      const newSet = new Set<string>();
      
      prev.forEach(taskId => {
        const task = tasks.find(t => t.id === taskId);
        // Keep the task ID in reminded set if:
        // 1. Task still exists
        // 2. Task is not completed  
        // 3. Task still has a reminder set
        // 4. The reminder time hasn't passed by more than 1 hour (to prevent re-notifications)
        if (task && !task.completed && task.reminder) {
          const reminderTime = new Date(task.reminder);
          const hoursSinceReminder = (currentTime.getTime() - reminderTime.getTime()) / (1000 * 60 * 60);
          
          // Keep in reminded set if reminder was within the last hour
          if (hoursSinceReminder <= 1) {
            newSet.add(taskId);
          }
        }
      });
      
      return newSet;
    });
  }, [tasks, currentTime]); // Add currentTime to dependencies

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Update badge when notifications change
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length > 0) {
      setShowBadge(true);
    } else {
      setShowBadge(false);
    }
  }, [notifications]);

  // Check reminders every 10 seconds with simple time comparison
  useEffect(() => {
    // Initial check
    checkReminders();
    
    // Set up interval - checking every 10 seconds
    const interval = setInterval(() => {
      checkReminders();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [checkReminders]);

  // Mark all notifications as read when opened
  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setShowBadge(false);
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setShowBadge(false);
  };

  // Clear specific notification
  const clearNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // If this was the last notification, hide the badge
    if (notifications.length === 1) {
      setShowBadge(false);
    }
    
    // Remove from reminded tasks so user can get reminded again if needed
    if (notification) {
      setRemindedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.taskId);
        return newSet;
      });
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format time left for display
  const formatTimeLeft = (task: Task) => {
    if (!task.reminder) {
      return task.deadline ? 'Reminder not set' : 'No deadline or reminder';
    }
    
    const reminderDate = new Date(task.reminder);
    const timeUntilReminderMs = reminderDate.getTime() - currentTime.getTime(); // Use currentTime state
    const minutesUntilReminder = Math.floor(timeUntilReminderMs / (1000 * 60));
    
    if (minutesUntilReminder <= 0) {
      return `reminder passed ${Math.abs(minutesUntilReminder)}min ago`;
    } else {
      return `${minutesUntilReminder}min until reminder`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Check if there are any upcoming reminders in the next hour
  const hasUpcomingReminders = tasks.some(task => {
    if (!task.reminder || task.completed) return false;
    const reminderTime = new Date(task.reminder);
    const timeUntilReminder = reminderTime.getTime() - currentTime.getTime();
    const minutesUntilReminder = Math.floor(timeUntilReminder / (1000 * 60));
    return minutesUntilReminder > 0 && minutesUntilReminder <= 60; // Within next hour
  });

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Reminders"
      >
        {/* Bell Icon */}
        <svg
          data-testid="bell-icon"
          className={`w-6 h-6 transition-colors ${
            hasUpcomingReminders 
              ? 'text-amber-500 dark:text-amber-400' 
              : 'text-gray-600 dark:text-gray-300'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Notification Badge */}
        {(showBadge || unreadCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 0 ? unreadCount : '!'}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-60 sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-[80vh] sm:max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Reminders
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Current time: {currentTime.toLocaleTimeString()}
                  </p>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-[60vh] sm:max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>No reminders at the moment</p>
                  {tasks.filter(t => t.reminder && !t.completed).length > 0 && (
                    <div className="text-xs mt-3 text-left space-y-1">
                      <p className="font-medium">Upcoming tasks with reminders:</p>
                      {tasks
                        .filter(t => t.reminder && !t.completed)
                        .sort((a, b) => new Date(a.reminder!).getTime() - new Date(b.reminder!).getTime()) // Sort by reminder time
                        .slice(0, 3)
                        .map(task => (
                          <div key={task.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {formatTimeLeft(task)}
                            </div>
                            <div className="text-gray-500 dark:text-gray-500 text-xs">
                              Reminder: {new Date(task.reminder!).toLocaleString()}
                              {task.deadline && (
                                <span> • Deadline: {new Date(task.deadline).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => clearNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
