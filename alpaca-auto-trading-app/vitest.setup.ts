import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {},
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => data,
      status: init?.status || 200,
    })),
    redirect: vi.fn(),
  },
}));

// Mock environment variables
vi.mock('process', () => ({
  env: {
    APCA_API_KEY_ID: 'test-key-id',
    APCA_API_SECRET_KEY: 'test-secret-key',
    APCA_PAPER_BASE_URL: 'https://paper-api.alpaca.markets/v2',
    NODE_ENV: 'test',
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('div', props, children);
    },
    span: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('span', props, children);
    },
    button: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('button', props, children);
    },
    section: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('section', props, children);
    },
    article: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('article', props, children);
    },
    h1: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h1', props, children);
    },
    h2: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h2', props, children);
    },
    h3: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h3', props, children);
    },
    p: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('p', props, children);
    },
    img: ({ ...props }: any) => {
      const React = require('react');
      return React.createElement('img', props);
    },
    ul: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('ul', props, children);
    },
    li: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('li', props, children);
    },
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: (value: any) => ({ get: () => value, set: vi.fn() }),
  useTransform: (value: any, transform: any) => transform(value),
}));

// Mock lightweight-charts
vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addCandlestickSeries: vi.fn(() => ({
      setData: vi.fn(),
      update: vi.fn(),
    })),
    addLineSeries: vi.fn(() => ({
      setData: vi.fn(),
      update: vi.fn(),
    })),
    timeScale: {
      fitContent: vi.fn(),
      setVisibleRange: vi.fn(),
    },
    remove: vi.fn(),
  })),
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    tradeJournal: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    watchlist: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    watchItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    portfolioSnapshot: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    aISignal: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    instrument: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    priceBar: {
      findMany: vi.fn(),
    },
  },
}));

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
  },
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
  },
}));

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));