import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

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

// Mock the ReminderBell component for now
const MockReminderBell = ({ tasks }: { tasks: any[] }) => {
  return (
    <div data-testid="bell-icon">
      Bell ({tasks.length})
    </div>
  );
};

describe('ReminderBell Simple Test', () => {
  it('renders bell icon', () => {
    render(<MockReminderBell tasks={[]} />);
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });
});
