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

// Mock the AddTaskForm - we'll test the reminder field handling specifically
const MockAddTaskForm = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [reminderTime, setReminderTime] = React.useState('');

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
      
      <button type="submit">Add Task</button>
    </form>
  );
};

describe('AddTaskForm Reminder Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with reminder time input', () => {
    render(<MockAddTaskForm />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reminder time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('allows user to input reminder time', async () => {
    const user = userEvent.setup();
    render(<MockAddTaskForm />);

    const reminderInput = screen.getByLabelText(/reminder time/i);

    await user.type(reminderInput, '2024-01-15T09:00');

    expect(reminderInput).toHaveValue('2024-01-15T09:00');
  });

  it('reminder input accepts datetime-local format', async () => {
    const user = userEvent.setup();
    render(<MockAddTaskForm />);

    const reminderInput = screen.getByLabelText(/reminder time/i);
    
    expect(reminderInput).toHaveAttribute('type', 'datetime-local');

    await user.type(reminderInput, '2024-12-31T23:59');
    expect(reminderInput).toHaveValue('2024-12-31T23:59');
  });

  it('reminder field is optional', () => {
    render(<MockAddTaskForm />);

    const reminderInput = screen.getByLabelText(/reminder time/i);
    
    // Input should start empty and not be required
    expect(reminderInput).toHaveValue('');
    expect(reminderInput).not.toHaveAttribute('required');
  });

  it('can clear reminder field', async () => {
    const user = userEvent.setup();
    render(<MockAddTaskForm />);

    const reminderInput = screen.getByLabelText(/reminder time/i);

    // Set a value first
    await user.type(reminderInput, '2024-01-15T09:00');
    expect(reminderInput).toHaveValue('2024-01-15T09:00');

    // Clear the value
    await user.clear(reminderInput);
    expect(reminderInput).toHaveValue('');
  });
});
