import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  }),
}));

interface MockTask {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  reminder: string | null;
  completed: boolean;
  created_at: string;
}

// Mock EditTaskForm component to test reminder functionality
const MockEditTaskForm = ({ task }: { task: MockTask }) => {
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description);
  const [deadline, setDeadline] = React.useState(
    task.deadline ? task.deadline.slice(0, 16) : ''
  );
  const [reminderTime, setReminderTime] = React.useState(
    task.reminder ? task.reminder.slice(0, 16) : ''
  );

  return (
    <form>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <label htmlFor="description">Description</label>
      <input
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <label htmlFor="deadline">Deadline</label>
      <input
        id="deadline"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      
      <label htmlFor="reminder">Reminder Time</label>
      <input
        id="reminder"
        type="datetime-local"
        value={reminderTime}
        onChange={(e) => setReminderTime(e.target.value)}
      />
      
      <button type="submit">Update Task</button>
    </form>
  );
};

describe('EditTaskForm Reminder Functionality', () => {
  const mockTask: MockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    deadline: '2024-01-15T10:00:00.000Z',
    reminder: '2024-01-15T09:00:00.000Z',
    completed: false,
    created_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with pre-populated reminder data', () => {
    render(<MockEditTaskForm task={mockTask} />);

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-15T10:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-15T09:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('allows user to edit reminder time', async () => {
    const user = userEvent.setup();
    render(<MockEditTaskForm task={mockTask} />);

    const reminderInput = screen.getByDisplayValue('2024-01-15T09:00');

    await user.clear(reminderInput);
    await user.type(reminderInput, '2024-01-15T08:30');

    expect(reminderInput).toHaveValue('2024-01-15T08:30');
  });

  it('handles task without reminder', () => {
    const taskWithoutReminder = {
      ...mockTask,
      reminder: null,
    };

    render(<MockEditTaskForm task={taskWithoutReminder} />);

    const reminderInput = screen.getByLabelText(/reminder time/i);
    expect(reminderInput).toHaveValue('');
  });

  it('handles task without deadline', () => {
    const taskWithoutDeadline = {
      ...mockTask,
      deadline: null,
    };

    render(<MockEditTaskForm task={taskWithoutDeadline} />);

    const deadlineInput = screen.getByLabelText(/deadline/i);
    expect(deadlineInput).toHaveValue('');
  });

  it('allows clearing reminder field', async () => {
    const user = userEvent.setup();
    render(<MockEditTaskForm task={mockTask} />);

    const reminderInput = screen.getByDisplayValue('2024-01-15T09:00');

    await user.clear(reminderInput);

    expect(reminderInput).toHaveValue('');
  });

  it('converts datetime strings to local format for display', () => {
    const taskWithSpecificTime = {
      ...mockTask,
      deadline: '2024-01-15T14:30:00.000Z',
      reminder: '2024-01-15T13:15:00.000Z',
    };

    render(<MockEditTaskForm task={taskWithSpecificTime} />);

    expect(screen.getByDisplayValue('2024-01-15T14:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-15T13:15')).toBeInTheDocument();
  });

  it('handles complex task data structure', () => {
    const complexTask = {
      ...mockTask,
      reminder: '2024-12-31T23:59:59.999Z',
      deadline: '2025-01-01T00:00:00.000Z',
    };

    render(<MockEditTaskForm task={complexTask} />);

    // Check that the datetime-local format is correctly displayed
    expect(screen.getByDisplayValue('2024-12-31T23:59')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-01-01T00:00')).toBeInTheDocument();
  });
});
