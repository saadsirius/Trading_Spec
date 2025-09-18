import type { OrderInput } from '@/lib/zodSchemas';
import { trackOrderSubmit, trackOrderError } from '@/lib/analytics/Analytics';
import { showError, showSuccess } from '@/lib/toast/ToastService';
import { orderSubmissionRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export class ClickHandlerService {
  private isSubmitting = false;

  async submitOrder(orderData: OrderInput): Promise<boolean> {
    // Check rate limiting
    const rateLimitKey = getRateLimitKey('order', orderData.symbol);
    if (!orderSubmissionRateLimit.isAllowed(rateLimitKey)) {
      const timeUntilReset = orderSubmissionRateLimit.getTimeUntilReset(rateLimitKey);
      showError(
        'Rate Limited',
        `Please wait ${Math.ceil(timeUntilReset / 1000)} seconds before submitting another order for ${orderData.symbol}`
      );
      return false;
    }

    // Prevent double submission
    if (this.isSubmitting) {
      showError('Order in Progress', 'Please wait for the current order to complete');
      return false;
    }

    this.isSubmitting = true;

    try {
      // Track order submission
      trackOrderSubmit(orderData.symbol, orderData.side, Number(orderData.qty));

      // Submit order to API
      const response = await fetch('/api/alpaca/trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Order submission failed');
      }

      const result = await response.json();
      
      // Show success message
      showSuccess(
        'Order Submitted',
        `${orderData.side.toUpperCase()} ${orderData.qty} ${orderData.symbol} - Order ID: ${result.id}`
      );

      return true;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      // Track error
      trackOrderError(orderData.symbol, message);
      
      // Show error message
      showError('Order Failed', message);
      
      return false;
    } finally {
      this.isSubmitting = false;
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/alpaca/trading/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Order cancellation failed');
      }

      showSuccess('Order Cancelled', `Order ${orderId} has been cancelled`);
      return true;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showError('Cancellation Failed', message);
      return false;
    }
  }

  async refreshPositions(): Promise<boolean> {
    try {
      const response = await fetch('/api/alpaca/trading?action=positions');
      
      if (!response.ok) {
        throw new Error('Failed to refresh positions');
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showError('Refresh Failed', message);
      return false;
    }
  }

  async refreshAccount(): Promise<boolean> {
    try {
      const response = await fetch('/api/alpaca/trading?action=account');
      
      if (!response.ok) {
        throw new Error('Failed to refresh account');
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showError('Refresh Failed', message);
      return false;
    }
  }

  // Get current submission state
  getIsSubmitting(): boolean {
    return this.isSubmitting;
  }
}

// Singleton instance
export const clickHandlerService = new ClickHandlerService();
