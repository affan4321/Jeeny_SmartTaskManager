import '@testing-library/jest-dom';
import {
  convertISOToDatetimeLocal,
  convertDatetimeLocalToISO,
  formatDateForAPI,
  formatTimeUntilReminder,
  isReminderDue,
  isReminderUpcoming,
} from '../../lib/utils/reminder-utils';

describe('Reminder Utils', () => {
  describe('convertISOToDatetimeLocal', () => {
    it('formats ISO date string for datetime-local input', () => {
      const isoString = '2024-01-15T10:30:00.000Z';
      const result = convertISOToDatetimeLocal(isoString);
      expect(result).toBe('2024-01-15T10:30');
    });

    it('returns empty string for null input', () => {
      const result = convertISOToDatetimeLocal(null);
      expect(result).toBe('');
    });
  });

  describe('isReminderDue', () => {
    it('returns true for reminder due within an hour', () => {
      const currentTime = new Date('2024-01-15T10:00:00.000Z');
      const reminderTime = '2024-01-15T10:30:00.000Z';
      const result = isReminderDue(reminderTime, currentTime);
      expect(result).toBe(true);
    });

    it('returns false for null reminder time', () => {
      const currentTime = new Date('2024-01-15T10:00:00.000Z');
      const result = isReminderDue(null, currentTime);
      expect(result).toBe(false);
    });
  });

  describe('formatDateForAPI', () => {
    it('formats Date object to ISO string', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = formatDateForAPI(date);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
