/**
 * Utility functions for handling reminder logic
 */

/**
 * Checks if a reminder is due (within the next hour)
 * @param reminderTime - The reminder time as ISO string
 * @param currentTime - Current time (defaults to new Date())
 * @returns boolean indicating if reminder is due
 */
export function isReminderDue(reminderTime: string | null, currentTime: Date = new Date()): boolean {
  if (!reminderTime) return false;
  
  const reminderDate = new Date(reminderTime);
  const timeDiff = reminderDate.getTime() - currentTime.getTime();
  const minutesUntilReminder = Math.floor(timeDiff / (1000 * 60));
  
  return minutesUntilReminder <= 60 && minutesUntilReminder > 0;
}

/**
 * Checks if a reminder is upcoming (within the next 24 hours)
 * @param reminderTime - The reminder time as ISO string
 * @param currentTime - Current time (defaults to new Date())
 * @returns boolean indicating if reminder is upcoming
 */
export function isReminderUpcoming(reminderTime: string | null, currentTime: Date = new Date()): boolean {
  if (!reminderTime) return false;
  
  const reminderDate = new Date(reminderTime);
  const timeDiff = reminderDate.getTime() - currentTime.getTime();
  const minutesUntilReminder = Math.floor(timeDiff / (1000 * 60));
  
  return minutesUntilReminder > 0 && minutesUntilReminder <= 1440; // 24 hours
}

/**
 * Formats a date for API submission (ISO string format)
 * @param date - The date to format
 * @returns ISO string representation of the date
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString();
}

/**
 * Formats the time until a reminder in human-readable format
 * @param reminderTime - The reminder time as ISO string
 * @param currentTime - Current time (defaults to new Date())
 * @returns Human-readable time until reminder
 */
export function formatTimeUntilReminder(reminderTime: string | null, currentTime: Date = new Date()): string {
  if (!reminderTime) return 'No reminder set';
  
  const reminderDate = new Date(reminderTime);
  const timeDiff = reminderDate.getTime() - currentTime.getTime();
  const minutesUntilReminder = Math.floor(timeDiff / (1000 * 60));
  
  if (minutesUntilReminder <= 0) {
    return `Reminder passed ${Math.abs(minutesUntilReminder)} minutes ago`;
  } else if (minutesUntilReminder < 60) {
    return `${minutesUntilReminder} minutes until reminder`;
  } else {
    const hours = Math.floor(minutesUntilReminder / 60);
    const minutes = minutesUntilReminder % 60;
    return `${hours}h ${minutes}m until reminder`;
  }
}

/**
 * Converts a datetime-local input value to ISO string
 * @param datetimeLocalValue - The value from datetime-local input
 * @returns ISO string representation
 */
export function convertDatetimeLocalToISO(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return '';
  
  const date = new Date(datetimeLocalValue);
  return date.toISOString();
}

/**
 * Converts an ISO string to datetime-local input format
 * @param isoString - The ISO string to convert
 * @returns datetime-local compatible string
 */
export function convertISOToDatetimeLocal(isoString: string | null): string {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  return date.toISOString().slice(0, 16);
}
