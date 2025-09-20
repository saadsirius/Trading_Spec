/**
 * File: __tests__/trading/OrderEntry.test.tsx
 * Purpose: Unit tests for OrderEntry component
 * Key dependencies: Jest, React Testing Library, zustand
 * Learning Angle: This demonstrates how to test complex form validation and
 * user interactions in a trading application. Notice how we test different
 * validation scenarios and user flows.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderEntry from '../../app/trading/components/OrderEntry';
import { useTradingStore } from '../../src/state/tradingStore';
import { useNotificationStore } from '../../src/state/notificationStore';

// Mock the stores
jest.mock('../../src/state/tradingStore');
jest.mock('../../src/state/notificationStore');

// Mock fetch
global.fetch = jest.fn();

const mockTradingStore = useTradingStore as jest.MockedFunction<typeof useTradingStore>;
const mockNotificationStore = useNotificationStore as jest.MockedFunction<typeof useNotificationStore>;

describe('OrderEntry', () => {
  const mockAccount = {
    id: 'test-account',
    buying_power: '10000',
    equity: '10000',
  };

  const mockOnOrderSubmitted = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock trading store
    mockTradingStore.mockReturnValue({
      mode: 'paper',
      getPositionBySymbol: jest.fn().mockReturnValue(null),
      getBuyingPower: jest.fn().mockReturnValue(10000),
    } as any);

    // Mock notification store
    mockNotificationStore.mockReturnValue({
      addNotification: jest.fn(),
    } as any);

    // Mock fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'test-order' }),
    });
  });

  it('renders order entry form with default values', () => {
    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Buy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('limit')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <OrderEntry 
        symbol="" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    // Clear symbol field
    const symbolInput = screen.getByDisplayValue('');
    await user.clear(symbolInput);

    // Try to submit
    const submitButton = screen.getByText('Submit Order');
    expect(submitButton).toBeDisabled();
  });

  it('validates quantity is positive', async () => {
    const user = userEvent.setup();
    
    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    const qtyInput = screen.getByDisplayValue('1');
    await user.clear(qtyInput);
    await user.type(qtyInput, '0');

    // Submit button should be disabled
    const submitButton = screen.getByText('Submit Order');
    expect(submitButton).toBeDisabled();
  });

  it('validates limit price for limit orders', async () => {
    const user = userEvent.setup();
    
    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    // Order type is already 'limit' by default
    // Submit button should be disabled without limit price
    const submitButton = screen.getByText('Submit Order');
    expect(submitButton).toBeDisabled();

    // Add limit price
    const limitPriceInput = screen.getByPlaceholderText('Enter limit price');
    await user.type(limitPriceInput, '150.00');

    // Submit button should now be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('validates buying power for buy orders', async () => {
    const user = userEvent.setup();
    
    // Mock insufficient buying power
    mockTradingStore.mockReturnValue({
      mode: 'paper',
      getPositionBySymbol: jest.fn().mockReturnValue(null),
      getBuyingPower: jest.fn().mockReturnValue(100), // Low buying power
    } as any);

    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    // Set high quantity and limit price
    const qtyInput = screen.getByDisplayValue('1');
    await user.clear(qtyInput);
    await user.type(qtyInput, '100');

    const limitPriceInput = screen.getByPlaceholderText('Enter limit price');
    await user.type(limitPriceInput, '150.00');

    // Should show buying power error
    await waitFor(() => {
      expect(screen.getByText(/Insufficient buying power/)).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit Order');
    expect(submitButton).toBeDisabled();
  });

  it('validates position quantity for sell orders', async () => {
    const user = userEvent.setup();
    
    // Mock position with limited quantity
    mockTradingStore.mockReturnValue({
      mode: 'paper',
      getPositionBySymbol: jest.fn().mockReturnValue({
        qty: '10',
        side: 'long',
      }),
      getBuyingPower: jest.fn().mockReturnValue(10000),
    } as any);

    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    // Switch to sell
    const sellButton = screen.getByText('Sell');
    await user.click(sellButton);

    // Set quantity higher than position
    const qtyInput = screen.getByDisplayValue('1');
    await user.clear(qtyInput);
    await user.type(qtyInput, '20');

    // Should show insufficient shares error
    await waitFor(() => {
      expect(screen.getByText(/Insufficient shares/)).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit Order');
    expect(submitButton).toBeDisabled();
  });

  it('shows order preview when preview button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    // Add limit price to make form valid
    const limitPriceInput = screen.getByPlaceholderText('Enter limit price');
    await user.type(limitPriceInput, '150.00');

    // Click preview button
    const previewButton = screen.getByText('Preview Order');
    await user.click(previewButton);

    // Should show preview modal
    await waitFor(() => {
      expect(screen.getByText('Order Preview')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('BUY')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });
  });

  it('submits order successfully', async () => {
    const user = userEvent.setup();
    
    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    // Add limit price to make form valid
    const limitPriceInput = screen.getByPlaceholderText('Enter limit price');
    await user.type(limitPriceInput, '150.00');

    // Submit order
    const submitButton = screen.getByText('Submit Order');
    await user.click(submitButton);

    // Should call fetch with correct payload
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"symbol":"AAPL"'),
      });
    });

    // Should call onOrderSubmitted
    expect(mockOnOrderSubmitted).toHaveBeenCalled();
  });

  it('handles order submission error', async () => {
    const user = userEvent.setup();
    
    // Mock fetch error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Order failed' }),
    });

    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    // Add limit price to make form valid
    const limitPriceInput = screen.getByPlaceholderText('Enter limit price');
    await user.type(limitPriceInput, '150.00');

    // Submit order
    const submitButton = screen.getByText('Submit Order');
    await user.click(submitButton);

    // Should show error notification
    await waitFor(() => {
      expect(mockNotificationStore().addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'critical',
          title: 'Order Failed',
        })
      );
    });
  });

  it('switches between order types correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    const orderTypeSelect = screen.getByDisplayValue('limit');
    
    // Switch to market order
    await user.selectOptions(orderTypeSelect, 'market');
    
    // Limit price field should be hidden
    expect(screen.queryByPlaceholderText('Enter limit price')).not.toBeInTheDocument();
    
    // Submit button should be enabled (no limit price required)
    const submitButton = screen.getByText('Submit Order');
    expect(submitButton).not.toBeDisabled();
  });

  it('handles stop orders correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <OrderEntry 
        symbol="AAPL" 
        account={mockAccount} 
        onOrderSubmitted={mockOnOrderSubmitted} 
      />
    );

    const orderTypeSelect = screen.getByDisplayValue('limit');
    
    // Switch to stop order
    await user.selectOptions(orderTypeSelect, 'stop');
    
    // Stop price field should be visible
    expect(screen.getByPlaceholderText('Enter stop price')).toBeInTheDocument();
    
    // Submit button should be disabled without stop price
    const submitButton = screen.getByText('Submit Order');
    expect(submitButton).toBeDisabled();
  });
});
