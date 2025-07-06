"use client";

import { useState, useEffect, useCallback } from "react";
// import { createClient } from "@/lib/supabase/client"; // Commented out as not currently used

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline: string | null;
  reminder_minutes_before: number | null;
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

  // Check for upcoming reminders
  const checkReminders = useCallback(() => {
    console.log('🔔 Checking reminders...', { 
      tasksCount: tasks.length, 
      currentTime: new Date().toLocaleString(),
      tasksWithReminders: tasks.filter(t => t.reminder_minutes_before && t.deadline && !t.completed).length,
      allTasks: tasks.map(t => ({
        title: t.title,
        deadline: t.deadline,
        reminder: t.reminder_minutes_before,
        completed: t.completed
      }))
    });
    
    const now = new Date();
    const newNotifications: ReminderNotification[] = [];
    
    // Process each task and check if it needs a reminder
    tasks.forEach(task => {
      console.log(`🔍 Checking task: ${task.title}`, {
        hasDeadline: !!task.deadline,
        hasReminder: !!task.reminder_minutes_before,
        isCompleted: task.completed
      });
      
      if (task.deadline && task.reminder_minutes_before && !task.completed) {
        const deadlineDate = new Date(task.deadline);
        const timeUntilDeadlineMs = deadlineDate.getTime() - now.getTime();
        const minutesUntilDeadline = Math.floor(timeUntilDeadlineMs / (1000 * 60));
        const reminderThreshold = task.reminder_minutes_before;
        
        console.log(`📋 Task: ${task.title}`, {
          deadlineRaw: task.deadline,
          deadlineDate: deadlineDate.toLocaleString(),
          deadlineISO: deadlineDate.toISOString(),
          now: now.toLocaleString(),
          nowISO: now.toISOString(),
          timeUntilDeadlineMs,
          minutesUntilDeadline,
          reminderThreshold,
          shouldRemind: minutesUntilDeadline <= reminderThreshold,
          alreadyReminded: remindedTasks.has(task.id),
          existingNotificationCount: notifications.filter(n => n.taskId === task.id).length
        });
        
        // Check if time remaining is within the reminder threshold (including past due)
        if (minutesUntilDeadline <= reminderThreshold) {
          // Check if we already have a notification for this task OR if we've already reminded about it
          const existingNotification = notifications.find(n => n.taskId === task.id);
          const alreadyReminded = remindedTasks.has(task.id);
          
          console.log(`🎯 Task ${task.title} meets criteria:`, {
            existingNotification: !!existingNotification,
            alreadyReminded,
            willCreateNotification: !existingNotification && !alreadyReminded
          });
          
          if (!existingNotification && !alreadyReminded) {
            console.log(`✅ Creating notification for task: ${task.title}`);
            const message = minutesUntilDeadline <= 0 
              ? `Reminder: "${task.title}" is overdue by ${Math.abs(minutesUntilDeadline)} minutes`
              : `Reminder: "${task.title}" is due in ${minutesUntilDeadline} minutes`;
            
            newNotifications.push({
              id: `${task.id}-${Date.now()}`,
              taskId: task.id,
              title: task.title,
              message,
              timestamp: now,
              isRead: false
            });
          } else {
            console.log(`❌ Skipping task: ${task.title} - ${existingNotification ? 'has existing notification' : 'already reminded'}`);
          }
        } else {
          console.log(`⏰ Task ${task.title} doesn't meet time criteria:`, {
            minutesLeft: minutesUntilDeadline,
            reminderThreshold,
            tooEarly: minutesUntilDeadline > reminderThreshold
          });
        }
      } else {
        console.log(`❓ Task ${task.title} filtered out:`, {
          noDeadline: !task.deadline,
          noReminder: !task.reminder_minutes_before,
          isCompleted: task.completed
        });
      }
    });

    console.log(`📊 Summary: Found ${newNotifications.length} new notifications to create`);

    if (newNotifications.length > 0) {
      console.log(`🎯 Adding ${newNotifications.length} new notifications:`, newNotifications.map(n => n.title));
      
      // Update notifications
      setNotifications(prev => {
        console.log(`📝 Previous notifications: ${prev.length}, Adding: ${newNotifications.length}`);
        return [...prev, ...newNotifications];
      });
      
      // Update reminded tasks
      setRemindedTasks(prev => {
        const newSet = new Set(prev);
        newNotifications.forEach(notification => {
          newSet.add(notification.taskId);
          console.log(`🏷️ Added ${notification.taskId} to reminded tasks`);
        });
        console.log(`🗂️ Updated reminded tasks:`, Array.from(newSet));
        return newSet;
      });
      
      // Show badge
      setShowBadge(true);
      console.log(`🎯 Badge should now be visible`);
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        console.log(`🔔 Browser notifications permission granted, showing ${newNotifications.length} notifications`);
        newNotifications.forEach(notification => {
          new Notification(`Task Reminder: ${notification.title}`, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        });
      } else {
        console.log(`🚫 Browser notifications not permitted: ${Notification.permission}`);
      }
    } else {
      console.log('🚫 No new notifications to add');
    }
  }, [tasks, notifications, remindedTasks]);

  // Clean up reminded tasks when tasks are completed, deleted, or deadlines pass
  useEffect(() => {
    // const currentTaskIds = new Set(tasks.map(t => t.id)); // Not used, commented out
    const now = new Date();
    
    setRemindedTasks(prev => {
      const newSet = new Set<string>();
      prev.forEach(taskId => {
        const task = tasks.find(t => t.id === taskId);
        // Keep the task ID in reminded set if:
        // 1. Task still exists
        // 2. Task is not completed
        // 3. Deadline hasn't passed yet
        if (task && !task.completed && task.deadline) {
          const deadlineDate = new Date(task.deadline);
          if (deadlineDate > now) {
            newSet.add(taskId);
          }
        }
      });
      return newSet;
    });
  }, [tasks]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check reminders every half minute
  useEffect(() => {
    // Initial check
    checkReminders();
    
    // Set up interval
    const interval = setInterval(() => {
      checkReminders();
    }, 30000); // Check every 30 secs

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

  // Temporary test function for debugging
  const testReminders = () => {
    console.log('🧪 Manual reminder check triggered');
    console.log('🧪 Current state:', {
      notifications: notifications.length,
      remindedTasks: Array.from(remindedTasks),
      tasksWithReminders: tasks.filter(t => t.reminder_minutes_before && t.deadline && !t.completed)
    });
    
    // Force create a test notification to verify the system works
    const testNotification: ReminderNotification = {
      id: `test-${Date.now()}`,
      taskId: 'test-task',
      title: 'Test Reminder',
      message: 'This is a test to verify reminders are working',
      timestamp: new Date(),
      isRead: false
    };
    
    console.log('🧪 Creating test notification:', testNotification);
    setNotifications(prev => {
      console.log('🧪 Previous notifications:', prev.length);
      return [...prev, testNotification];
    });
    setShowBadge(true);
    console.log('🧪 Test notification created and badge shown');
    
    // Test the date parsing with a specific example
    const now = new Date();
    const futureDate = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
    console.log('🧪 Date test:', {
      now: now.toLocaleString(),
      nowISO: now.toISOString(),
      future: futureDate.toLocaleString(),
      futureISO: futureDate.toISOString(),
      difference: Math.floor((futureDate.getTime() - now.getTime()) / (1000 * 60))
    });
    
    // Also run the actual reminder check
    console.log('🧪 Running actual reminder check...');
    checkReminders();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Reminders"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-300"
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
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Reminders
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={testReminders}
                    className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    Test
                  </button>
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
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>No reminders at the moment</p>
                  <div className="text-xs mt-2 text-left space-y-1">
                    <p><strong>Total tasks:</strong> {tasks.length}</p>
                    <p><strong>Tasks with reminders:</strong> {tasks.filter(t => t.reminder_minutes_before && t.deadline && !t.completed).length}</p>
                    <p><strong>Reminded tasks:</strong> {remindedTasks.size}</p>
                    <p><strong>Current time:</strong> {new Date().toLocaleString()}</p>
                    {tasks.filter(t => t.reminder_minutes_before && t.deadline && !t.completed).slice(0, 3).map(task => {
                      const deadlineDate = new Date(task.deadline!);
                      const minutesUntilDeadline = Math.floor((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60));
                      return (
                        <div key={task.id} className="p-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          <strong>{task.title}</strong>: {minutesUntilDeadline}min left, remind at {task.reminder_minutes_before}min
                        </div>
                      );
                    })}
                  </div>
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
