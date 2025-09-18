import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HistoryPage from '@/app/history/page';

describe('HistoryPage', () => {
  it('renders history page title', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Historique des Transactions')).toBeInTheDocument();
    });
  });

  it('renders filters section', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('AAPL, TSLA...')).toBeInTheDocument();
    });
  });

  it('renders transactions table', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('BUY')).toBeInTheDocument();
    });
  });
});
