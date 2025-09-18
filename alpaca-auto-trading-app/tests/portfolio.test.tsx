import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioPage from '@/app/portfolio/page';

// Mock the store
vi.mock('@/store/portfolio', () => ({
  usePortfolioStore: () => ({
    positions: [
      {
        id: '1',
        symbol: 'AAPL',
        qty: 100,
        avgPrice: 150.00,
        marketPrice: 175.50,
        pnl: 2550.00,
        pnlPct: 17.00,
        sector: 'Technology',
        updatedAt: new Date().toISOString(),
      },
    ],
    summary: {
      equity: 125000.00,
      cash: 15000.00,
      dayPnl: 1250.00,
      dayPnlPct: 1.01,
      allTimePnl: 3497.50,
    },
    isLoading: false,
    error: null,
    setPositions: vi.fn(),
    setSummary: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  }),
}));

describe('PortfolioPage', () => {
  it('renders portfolio summary cards', async () => {
    render(<PortfolioPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Équité Totale')).toBeInTheDocument();
      expect(screen.getByText('$125,000')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
      expect(screen.getByText('$15,000')).toBeInTheDocument();
    });
  });

  it('renders positions table', async () => {
    render(<PortfolioPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Positions')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('$2,550.00')).toBeInTheDocument();
    });
  });

  it('renders chart component', async () => {
    render(<PortfolioPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});
