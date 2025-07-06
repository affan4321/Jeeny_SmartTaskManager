import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Notification API
const NotificationMock = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
})) as any;

// Add static properties to the mock
NotificationMock.permission = 'default';
NotificationMock.requestPermission = jest.fn(() => Promise.resolve('granted'));

// Assign to global
(global as any).Notification = NotificationMock;

// Mock NextRequest specifically for Next.js API routes
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || 'GET',
    headers: new Map(Object.entries(options?.headers || {})),
    json: jest.fn(() => Promise.resolve(options?.body ? JSON.parse(options.body) : {})),
  })),
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      headers: options?.headers || {},
      data,
      json: jest.fn(() => Promise.resolve(data)),
    })),
  },
}));