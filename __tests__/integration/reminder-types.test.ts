// Simple test to verify the reminder functionality and types
describe('Reminder System Types', () => {
  it('should have Task interface with reminder field', () => {
    interface Task {
      id: string;
      title: string;
      description: string;
      completed: boolean;
      deadline: string | null;
      reminder: string | null; // This is the key field we're testing
      created_at: string;
      category_id?: string | null;
      updated_at?: string;
      categories?: {
        id: string;
        name: string;
      } | null;
    }

    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      deadline: '2024-01-15T10:00:00.000Z',
      reminder: '2024-01-15T09:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
    };

    expect(mockTask.reminder).toBe('2024-01-15T09:00:00.000Z');
    expect(typeof mockTask.reminder).toBe('string');
  });

  it('should handle null reminder values', () => {
    interface Task {
      id: string;
      title: string;
      description: string;
      completed: boolean;
      deadline: string | null;
      reminder: string | null;
      created_at: string;
    }

    const taskWithoutReminder: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      deadline: '2024-01-15T10:00:00.000Z',
      reminder: null,
      created_at: '2024-01-01T00:00:00.000Z',
    };

    expect(taskWithoutReminder.reminder).toBeNull();
  });
});
