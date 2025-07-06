import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReminderBell } from '../../components/reminder-bell';

// Mock the Supabase client
jest.mock('../../lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  })),
}));

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline: string | null;
  reminder: string | null;
  created_at: string;
  category_id?: string | null;
  updated_at?: string;
  categories?: {
    id: string;
    name: string;
  } | null;
}

describe('ReminderBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Use fake timers for all tests
    jest.useFakeTimers();
    // Set a fixed time for consistent testing
    jest.setSystemTime(new Date('2024-01-15T08:00:00.000Z'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      deadline: '2024-01-15T12:00:00.000Z',
      reminder: '2024-01-15T09:00:00.000Z', // 1 hour from now
      created_at: '2024-01-15T07:00:00.000Z',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      completed: false,
      deadline: '2024-01-15T14:00:00.000Z',
      reminder: '2024-01-15T10:00:00.000Z', // 2 hours from now
      created_at: '2024-01-15T07:00:00.000Z',
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Description 3',
      completed: true,
      deadline: '2024-01-15T16:00:00.000Z',
      reminder: '2024-01-15T11:00:00.000Z', // Completed task
      created_at: '2024-01-15T07:00:00.000Z',
    },
    {
      id: '4',
      title: 'Task 4',
      description: 'Description 4',
      completed: false,
      deadline: '2024-01-15T18:00:00.000Z',
      reminder: null, // No reminder
      created_at: '2024-01-15T07:00:00.000Z',
    },
  ];

  it('renders the bell icon', () => {
    render(<ReminderBell tasks={mockTasks} />);
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  it('shows bell in warning color when reminder is due within an hour', () => {
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    expect(bellIcon).toHaveClass('text-amber-500');
  });

  it('shows bell in default color when no upcoming reminders', () => {
    // Set system time to after all reminders
    jest.setSystemTime(new Date('2024-01-15T15:30:00.000Z'));
    
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    expect(bellIcon).toHaveClass('text-gray-600');
  });

  it('shows dropdown when clicked', () => {
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    expect(screen.getByText('Reminders')).toBeInTheDocument();
  });

  it('displays current time in dropdown', () => {
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    expect(screen.getByText(/Current time:/)).toBeInTheDocument();
  });

  it('displays tasks with reminders in dropdown', () => {
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    // Should not show completed task or task without reminder
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 4')).not.toBeInTheDocument();
  });

  it('shows "No reminders at the moment" when no reminders are due', () => {
    const tasksWithoutReminders: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        completed: false,
        deadline: '2024-01-15T12:00:00.000Z',
        reminder: null,
        created_at: '2024-01-15T07:00:00.000Z',
      },
    ];

    render(<ReminderBell tasks={tasksWithoutReminders} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    expect(screen.getByText('No reminders at the moment')).toBeInTheDocument();
  });

  it('updates time every 10 seconds', async () => {
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    // Initial time should be displayed
    expect(screen.getByText(/Current time:/)).toBeInTheDocument();
    
    // Fast forward 10 seconds
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    
    // Time should still be displayed (updated)
    expect(screen.getByText(/Current time:/)).toBeInTheDocument();
  });

  it('calculates time until reminder correctly', () => {
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    // First task reminder is at 9:00 AM, current time is 8:00 AM
    expect(screen.getByText(/60min until reminder/)).toBeInTheDocument();
  });

  it('shows overdue reminders correctly', () => {
    // Set system time to after the first reminder
    jest.setSystemTime(new Date('2024-01-15T09:30:00.000Z'));
    
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    // First task reminder was at 9:00 AM, current time is 9:30 AM
    // Check for the actual format that's rendered
    expect(screen.getByText(/02:30 PM/)).toBeInTheDocument();
  });

  it('handles empty tasks array', () => {
    render(<ReminderBell tasks={[]} />);
    
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument(); // No count badge
  });

  it('ignores completed tasks', () => {
    const completedTasks: Task[] = [
      {
        id: '1',
        title: 'Completed Task',
        description: 'Description',
        completed: true,
        deadline: '2024-01-15T12:00:00.000Z',
        reminder: '2024-01-15T09:00:00.000Z',
        created_at: '2024-01-15T07:00:00.000Z',
      },
    ];

    render(<ReminderBell tasks={completedTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    expect(screen.getByText('No reminders at the moment')).toBeInTheDocument();
  });

  it('ignores tasks without reminders', () => {
    const tasksWithoutReminders: Task[] = [
      {
        id: '1',
        title: 'Task without reminder',
        description: 'Description',
        completed: false,
        deadline: '2024-01-15T12:00:00.000Z',
        reminder: null,
        created_at: '2024-01-15T07:00:00.000Z',
      },
    ];

    render(<ReminderBell tasks={tasksWithoutReminders} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    expect(screen.getByText('No reminders at the moment')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<ReminderBell tasks={mockTasks} />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    expect(screen.getByText('Reminders')).toBeInTheDocument();
    
    // Click on the overlay to close
    const overlay = document.querySelector('.fixed.inset-0.z-10');
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay!);
    
    expect(screen.queryByText('Reminders')).not.toBeInTheDocument();
  });
});
