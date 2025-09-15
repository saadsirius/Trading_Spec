import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OverviewPage } from '@/app/(trading)/components/Overview/OverviewPage';
import { KPICard } from '@/app/(trading)/components/Overview/KPICard';
import { SearchBar } from '@/app/(trading)/components/Overview/SearchBar';
import { Watchlist } from '@/app/(trading)/components/Overview/Watchlist';
import { OverviewPayload } from '@/lib/types/overview';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lightweight-charts
jest.mock('lightweight-charts', () => ({
  createChart: jest.fn(() => ({
    addAreaSeries: jest.fn(() => ({
      setData: jest.fn(),
    })),
    timeScale: jest.fn(() => ({
      fitContent: jest.fn(),
    })),
    applyOptions: jest.fn(),
    remove: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock SSE hook
jest.mock('@/app/(trading)/components/Overview/hooks/useOverviewSSE', () => ({
  useOverviewSSE: jest.fn(() => ({
    isConnected: true,
    lastUpdate: new Date().toISOString(),
  })),
}));

describe('OverviewPage', () => {
  const mockOverviewData: OverviewPayload = {
    mode: 'paper',
    asOf: new Date().toISOString(),
    kpis: {
      equity: 10025.42,
      cash: 2011.77,
      dayPnL: 35.21,
      totalPnL: 25.42,
      marginUsed: 0,
    },
    equityCurve: [
      { t: '2025-01-01', v: 10000 },
      { t: '2025-01-02', v: 10025.42 },
    ],
    positions: [
      {
        id: 'pos-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        qty: 10,
        avg: 150.00,
        last: 152.50,
        unrealized: 25.00,
        unrealizedPct: 1.67,
      },
    ],
    orders: [
      {
        id: 'order-1',
        t: new Date().toISOString(),
        symbol: 'AAPL',
        side: 'buy',
        qty: 10,
        status: 'filled',
        price: 150.00,
      },
    ],
    watchlist: [
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        last: 250.00,
        changePct: 2.5,
        spark: [240, 245, 250],
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        title: '[PAPER] Order filled: AAPL 10 @ $150.00',
        t: new Date().toISOString(),
        href: '/paper/journal?id=order-1',
      },
    ],
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: mockOverviewData,
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading skeleton initially', () => {
    render(<OverviewPage mode="paper" />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('PAPER TRADING')).toBeInTheDocument();
  });

  it('should render overview data when loaded', async () => {
    render(<OverviewPage mode="paper" />);
    
    await waitFor(() => {
      expect(screen.getByText('$10,025.42')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('TSLA')).toBeInTheDocument();
    });
  });

  it('should show live mode badge for live trading', async () => {
    render(<OverviewPage mode="live" />);
    
    await waitFor(() => {
      expect(screen.getByText('LIVE TRADING')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<OverviewPage mode="paper" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Overview')).toBeInTheDocument();
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });
  });

  it('should retry on error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<OverviewPage mode="paper" />);
    
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Mock successful retry
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: mockOverviewData,
      }),
    });

    fireEvent.click(screen.getByText('Retry'));
    
    await waitFor(() => {
      expect(screen.getByText('$10,025.42')).toBeInTheDocument();
    });
  });
});

describe('KPICard', () => {
  it('should render KPI card with currency format', () => {
    render(
      <KPICard
        title="Equity"
        value={10025.42}
        format="currency"
        trend={25.42}
        showTrend
      />
    );

    expect(screen.getByText('Equity')).toBeInTheDocument();
    expect(screen.getByText('$10,025.42')).toBeInTheDocument();
    expect(screen.getByText('+$25.42')).toBeInTheDocument();
  });

  it('should render KPI card with percent format', () => {
    render(
      <KPICard
        title="Return"
        value={2.5}
        format="percent"
        trend={1.2}
        showTrend
      />
    );

    expect(screen.getByText('Return')).toBeInTheDocument();
    expect(screen.getByText('+2.50%')).toBeInTheDocument();
    expect(screen.getByText('+1.20%')).toBeInTheDocument();
  });

  it('should show trend indicator for positive values', () => {
    render(
      <KPICard
        title="P&L"
        value={100}
        format="currency"
        trend={50}
        showTrend
      />
    );

    // Should show trending up icon (mocked as div)
    expect(screen.getByText('+$50.00')).toBeInTheDocument();
  });
});

describe('SearchBar', () => {
  it('should render search bar with keyboard shortcut', () => {
    render(<SearchBar />);
    
    expect(screen.getByText('Search symbols, pages...')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('should open search modal on Cmd+K', () => {
    render(<SearchBar />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    expect(screen.getByPlaceholderText('Search symbols, pages, actions...')).toBeInTheDocument();
  });

  it('should filter results based on query', () => {
    render(<SearchBar />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    const input = screen.getByPlaceholderText('Search symbols, pages, actions...');
    fireEvent.change(input, { target: { value: 'AAPL' } });
    
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
  });

  it('should close modal on Escape', () => {
    render(<SearchBar />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.getByPlaceholderText('Search symbols, pages, actions...')).toBeInTheDocument();
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByPlaceholderText('Search symbols, pages, actions...')).not.toBeInTheDocument();
  });

  it('should navigate results with arrow keys', () => {
    render(<SearchBar />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    const input = screen.getByPlaceholderText('Search symbols, pages, actions...');
    fireEvent.change(input, { target: { value: 'AAPL' } });
    
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Should trigger navigation (mocked as console.log)
  });
});

describe('Watchlist', () => {
  const mockWatchlistItems = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      last: 150.00,
      changePct: 1.5,
      spark: [145, 148, 150],
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      last: 250.00,
      changePct: -2.5,
      spark: [255, 252, 250],
    },
  ];

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('should render watchlist items', () => {
    render(<Watchlist items={mockWatchlistItems} mode="paper" />);
    
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('TSLA')).toBeInTheDocument();
    expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
  });

  it('should show empty state when no items', () => {
    render(<Watchlist items={[]} mode="paper" />);
    
    expect(screen.getByText('No symbols in watchlist')).toBeInTheDocument();
    expect(screen.getByText('Add symbols to track their performance')).toBeInTheDocument();
  });

  it('should add new symbol to watchlist', async () => {
    render(<Watchlist items={[]} mode="paper" />);
    
    const input = screen.getByPlaceholderText('Add symbol...');
    const addButton = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'NVDA' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          symbol: 'NVDA',
        }),
      });
    });
  });

  it('should remove symbol from watchlist', async () => {
    render(<Watchlist items={mockWatchlistItems} mode="paper" />);
    
    // Hover to show remove button
    const watchlistItem = screen.getByText('AAPL').closest('div');
    fireEvent.mouseEnter(watchlistItem!);
    
    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          symbol: 'AAPL',
        }),
      });
    });
  });
});
