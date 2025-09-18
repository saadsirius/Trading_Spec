/**
 * Tests for ClickHandler components and functionality.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { 
  ClickHandler, 
  OrderClickHandler, 
  PositionClickHandler,
  NotificationClickHandler 
} from '@/app/components/ClickHandler';
import { useClickHandlers } from '@/lib/hooks/useClickHandlers';

// Mock the click handlers hook
jest.mock('@/lib/hooks/useClickHandlers');
const mockUseClickHandlers = useClickHandlers as jest.MockedFunction<typeof useClickHandlers>;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('ClickHandler Components', () => {
  const mockClickHandlers = {
    handleOrderClick: jest.fn(),
    handlePositionClick: jest.fn(),
    handleNotificationClick: jest.fn(),
    handleChartClick: jest.fn(),
    handleNavigationClick: jest.fn(),
    handleQuickBuy: jest.fn(),
    handleQuickSell: jest.fn(),
    isLoading: false,
    error: null,
    lastAction: null,
  };

  beforeEach(() => {
    mockUseClickHandlers.mockReturnValue(mockClickHandlers);
    jest.clearAllMocks();
  });

  describe('ClickHandler', () => {
    it('renders children correctly', () => {
      render(
        <ClickHandler>
          <button>Test Button</button>
        </ClickHandler>
      );

      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      
      render(
        <ClickHandler onClick={handleClick}>
          <button>Test Button</button>
        </ClickHandler>
      );

      fireEvent.click(screen.getByText('Test Button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies hover variant classes', () => {
      render(
        <ClickHandler variant="hover" className="custom-class">
          <button>Test Button</button>
        </ClickHandler>
      );

      const button = screen.getByText('Test Button');
      expect(button).toHaveClass('hover:scale-105');
    });

    it('applies press variant classes', () => {
      render(
        <ClickHandler variant="press">
          <button>Test Button</button>
        </ClickHandler>
      );

      const button = screen.getByText('Test Button');
      expect(button).toHaveClass('active:scale-95');
    });

    it('disables button when loading', () => {
      mockUseClickHandlers.mockReturnValue({
        ...mockClickHandlers,
        isLoading: true,
      });

      render(
        <ClickHandler>
          <button>Test Button</button>
        </ClickHandler>
      );

      const button = screen.getByText('Test Button');
      expect(button).toBeDisabled();
    });

    it('disables button when disabled prop is true', () => {
      render(
        <ClickHandler disabled={true}>
          <button>Test Button</button>
        </ClickHandler>
      );

      const button = screen.getByText('Test Button');
      expect(button).toBeDisabled();
    });

    it('shows loading indicator when loading', () => {
      mockUseClickHandlers.mockReturnValue({
        ...mockClickHandlers,
        isLoading: true,
      });

      render(
        <ClickHandler>
          <button>Test Button</button>
        </ClickHandler>
      );

      expect(screen.getByRole('button')).toHaveClass('opacity-50');
    });
  });

  describe('OrderClickHandler', () => {
    const orderData = {
      symbol: 'AAPL',
      side: 'buy' as const,
      quantity: 10,
      orderType: 'market' as const,
      mode: 'paper' as const,
    };

    it('renders children correctly', () => {
      render(
        <OrderClickHandler orderData={orderData}>
          <button>Buy AAPL</button>
        </OrderClickHandler>
      );

      expect(screen.getByText('Buy AAPL')).toBeInTheDocument();
    });

    it('calls handleOrderClick when clicked', async () => {
      mockClickHandlers.handleOrderClick.mockResolvedValue(true);

      render(
        <OrderClickHandler orderData={orderData}>
          <button>Buy AAPL</button>
        </OrderClickHandler>
      );

      fireEvent.click(screen.getByText('Buy AAPL'));

      await waitFor(() => {
        expect(mockClickHandlers.handleOrderClick).toHaveBeenCalledWith(orderData);
      });
    });

    it('calls onSuccess when order is successful', async () => {
      const onSuccess = jest.fn();
      mockClickHandlers.handleOrderClick.mockResolvedValue(true);

      render(
        <OrderClickHandler orderData={orderData} onSuccess={onSuccess}>
          <button>Buy AAPL</button>
        </OrderClickHandler>
      );

      fireEvent.click(screen.getByText('Buy AAPL'));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onSuccess when order fails', async () => {
      const onSuccess = jest.fn();
      mockClickHandlers.handleOrderClick.mockResolvedValue(false);

      render(
        <OrderClickHandler orderData={orderData} onSuccess={onSuccess}>
          <button>Buy AAPL</button>
        </OrderClickHandler>
      );

      fireEvent.click(screen.getByText('Buy AAPL'));

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('PositionClickHandler', () => {
    const positionData = {
      symbol: 'AAPL',
      action: 'close' as const,
      positionId: 'pos_123',
    };

    it('renders children correctly', () => {
      render(
        <PositionClickHandler positionData={positionData}>
          <button>Close Position</button>
        </PositionClickHandler>
      );

      expect(screen.getByText('Close Position')).toBeInTheDocument();
    });

    it('calls handlePositionClick when clicked', async () => {
      mockClickHandlers.handlePositionClick.mockResolvedValue(true);

      render(
        <PositionClickHandler positionData={positionData}>
          <button>Close Position</button>
        </PositionClickHandler>
      );

      fireEvent.click(screen.getByText('Close Position'));

      await waitFor(() => {
        expect(mockClickHandlers.handlePositionClick).toHaveBeenCalledWith(positionData);
      });
    });
  });

  describe('NotificationClickHandler', () => {
    const notificationData = {
      notificationId: 'notif_123',
      action: 'mark_read' as const,
    };

    it('renders children correctly', () => {
      render(
        <NotificationClickHandler notificationData={notificationData}>
          <button>Mark as Read</button>
        </NotificationClickHandler>
      );

      expect(screen.getByText('Mark as Read')).toBeInTheDocument();
    });

    it('calls handleNotificationClick when clicked', async () => {
      mockClickHandlers.handleNotificationClick.mockResolvedValue(true);

      render(
        <NotificationClickHandler notificationData={notificationData}>
          <button>Mark as Read</button>
        </NotificationClickHandler>
      );

      fireEvent.click(screen.getByText('Mark as Read'));

      await waitFor(() => {
        expect(mockClickHandlers.handleNotificationClick).toHaveBeenCalledWith(notificationData);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles click handler errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockClickHandlers.handleOrderClick.mockRejectedValue(new Error('API Error'));

      const orderData = {
        symbol: 'AAPL',
        side: 'buy' as const,
        quantity: 10,
        orderType: 'market' as const,
        mode: 'paper' as const,
      };

      render(
        <OrderClickHandler orderData={orderData}>
          <button>Buy AAPL</button>
        </OrderClickHandler>
      );

      fireEvent.click(screen.getByText('Buy AAPL'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Click handler error:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('maintains button accessibility', () => {
      render(
        <ClickHandler>
          <button>Accessible Button</button>
        </ClickHandler>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Accessible Button');
    });

    it('preserves disabled state for accessibility', () => {
      render(
        <ClickHandler disabled={true}>
          <button>Disabled Button</button>
        </ClickHandler>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});

