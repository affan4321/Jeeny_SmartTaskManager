import { PUT } from '../../app/api/edit-task/route';
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
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          eq: (column2: string, value2: any) => ({
            select: (columns?: string) => ({
              single: () => Promise.resolve({ 
                data: { id: value, ...data, categories: { id: 'category-id', name: 'Work' } }, 
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

describe('/api/edit-task', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully updates a task with all fields', async () => {
    const requestBody = {
      taskId: '1',
      title: 'Updated Task',
      description: 'Updated Description',
      category: 'Work',
      deadline: '2024-01-16T11:00',
      reminder: '2024-01-16T10:00',
    };

    const request = new NextRequest('http://localhost:3000/api/edit-task', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      message: "Task updated successfully",
      task: expect.objectContaining({
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        category_id: 'category-id',
        deadline: expect.any(String),
        reminder: expect.any(String),
        completed: false,
        updated_at: expect.any(String),
        categories: expect.objectContaining({
          id: 'category-id',
          name: 'Work'
        })
      })
    });
  });

  it('successfully updates a task with null reminder', async () => {
    const requestBody = {
      taskId: '1',
      title: 'Updated Task',
      description: 'Updated Description',
      category: null,
      deadline: '2024-01-16T11:00',
      reminder: null,
    };

    const request = new NextRequest('http://localhost:3000/api/edit-task', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.task.reminder).toBeNull();
  });

  it('returns 400 for missing taskId', async () => {
    const requestBody = {
      title: 'Updated Task',
      description: 'Updated Description',
      category: null,
      deadline: '2024-01-16T11:00',
      reminder: null,
    };

    const request = new NextRequest('http://localhost:3000/api/edit-task', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Task ID is required');
  });

  it('returns 400 for missing title', async () => {
    const requestBody = {
      taskId: '1',
      description: 'Updated Description',
      category: null,
      deadline: '2024-01-16T11:00',
      reminder: null,
    };

    const request = new NextRequest('http://localhost:3000/api/edit-task', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Task title is required');
  });

  it('returns 400 for empty title', async () => {
    const requestBody = {
      taskId: '1',
      title: '',
      description: 'Updated Description',
      category: null,
      deadline: '2024-01-16T11:00',
      reminder: null,
    };

    const request = new NextRequest('http://localhost:3000/api/edit-task', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Task title is required');
  });
});
