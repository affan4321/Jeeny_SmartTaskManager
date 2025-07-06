import { POST } from '../../app/api/add-task/route';
import { NextRequest } from 'next/server';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          eq: (column2: string, value2: any) => ({
            single: () => Promise.resolve({ 
              data: table === 'user' ? { id: 'user-id' } : { id: 'category-id', name: 'Work' }, 
              error: null 
            }),
          }),
          single: () => Promise.resolve({ 
            data: table === 'user' ? { id: 'user-id' } : { id: 'category-id', name: 'Work' }, 
            error: null 
          }),
        }),
        single: () => Promise.resolve({ 
          data: table === 'user' ? { id: 'user-id' } : { id: 'category-id', name: 'Work' }, 
          error: null 
        }),
      }),
      insert: (data: any) => ({
        select: (columns?: string) => ({
          single: () => Promise.resolve({ 
            data: { id: '1', ...data[0] }, 
            error: null 
          }),
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          eq: (column2: string, value2: any) => ({
            select: (columns?: string) => ({
              single: () => Promise.resolve({ 
                data: { id: value, ...data }, 
                error: null 
              }),
            }),
          }),
        }),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ 
        data: { user: { id: 'user-id' } }, 
        error: null 
      }),
    },
  }),
}));

describe('/api/add-task', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully adds a task with all fields', async () => {
    const requestBody = {
      title: 'Test Task',
      description: 'Test Description',
      category: 'Work',
      deadline: '2024-01-15T10:00',
      reminder: '2024-01-15T09:00',
    };

    const request = new NextRequest('http://localhost:3000/api/add-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({
      message: "Task created successfully",
      task: expect.objectContaining({
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        category_id: 'category-id',
        deadline: expect.any(String),
        reminder: expect.any(String),
        completed: false,
        user_id: 'user-id'
      })
    });
  });

  it('successfully adds a task without reminder', async () => {
    const requestBody = {
      title: 'Test Task',
      description: 'Test Description',
      category: null,
      deadline: '2024-01-15T10:00',
      reminder: null,
    };

    const request = new NextRequest('http://localhost:3000/api/add-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.task.reminder).toBeNull();
  });

  it('successfully adds a task without deadline', async () => {
    const requestBody = {
      title: 'Test Task',
      description: 'Test Description',
      category: null,
      deadline: null,
      reminder: null,
    };

    const request = new NextRequest('http://localhost:3000/api/add-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.task.deadline).toBeNull();
  });

  it('returns 400 for missing title', async () => {
    const requestBody = {
      description: 'Test Description',
      category: null,
      deadline: '2024-01-15T10:00',
      reminder: '2024-01-15T09:00',
    };

    const request = new NextRequest('http://localhost:3000/api/add-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Task title is required');
  });

  it('returns 400 for empty title', async () => {
    const requestBody = {
      title: '',
      description: 'Test Description',
      category: null,
      deadline: '2024-01-15T10:00',
      reminder: '2024-01-15T09:00',
    };

    const request = new NextRequest('http://localhost:3000/api/add-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Task title is required');
  });

  it('handles malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/add-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
