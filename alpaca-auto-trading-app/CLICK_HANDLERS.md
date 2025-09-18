# 🖱️ Click Handler System Documentation

## Overview

The Click Handler System provides a comprehensive, centralized approach to handling all interactive elements in the Alpaca Trading App. It includes order placement, position management, notifications, chart interactions, and navigation with proper error handling, loading states, and analytics.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Click Handler System                     │
├─────────────────────────────────────────────────────────────┤
│  ClickHandlerService (Singleton)                           │
│  ├── Order Handlers                                        │
│  ├── Position Handlers                                     │
│  ├── Notification Handlers                                 │
│  ├── Chart Handlers                                        │
│  ├── Navigation Handlers                                   │
│  └── Analytics & Error Handling                            │
├─────────────────────────────────────────────────────────────┤
│  React Hooks (useClickHandlers)                            │
│  ├── useOrderHandlers                                      │
│  ├── usePositionHandlers                                   │
│  ├── useNotificationHandlers                               │
│  └── useChartHandlers                                      │
├─────────────────────────────────────────────────────────────┤
│  React Components                                          │
│  ├── ClickHandler (Generic)                                │
│  ├── OrderClickHandler                                     │
│  ├── PositionClickHandler                                  │
│  ├── NotificationClickHandler                              │
│  ├── ChartClickHandler                                     │
│  └── NavigationClickHandler                                │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Basic Usage with Hooks

```tsx
import { useOrderHandlers } from '@/lib/hooks/useClickHandlers';

function TradingButton() {
  const { placeOrder, quickBuy, quickSell, isLoading, error } = useOrderHandlers('paper');

  const handleBuy = async () => {
    const success = await placeOrder('AAPL', 'buy', 10, 'market');
    if (success) {
      console.log('Order placed successfully!');
    }
  };

  return (
    <button onClick={handleBuy} disabled={isLoading}>
      {isLoading ? 'Placing Order...' : 'Buy AAPL'}
    </button>
  );
}
```

### 2. Using Specialized Components

```tsx
import { OrderClickHandler } from '@/app/components/ClickHandler';

function OrderButton() {
  return (
    <OrderClickHandler
      orderData={{
        symbol: 'AAPL',
        side: 'buy',
        quantity: 10,
        orderType: 'market',
        mode: 'paper'
      }}
      onSuccess={() => console.log('Order successful!')}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      Buy AAPL
    </OrderClickHandler>
  );
}
```

### 3. Generic Click Handler

```tsx
import { ClickHandler } from '@/app/components/ClickHandler';

function CustomButton() {
  const handleClick = async () => {
    // Custom logic here
    console.log('Button clicked!');
  };

  return (
    <ClickHandler
      onClick={handleClick}
      variant="hover"
      className="p-4 bg-blue-500 rounded-lg"
    >
      Click Me
    </ClickHandler>
  );
}
```

## 📋 API Reference

### ClickHandlerService

The core service that handles all click interactions.

#### Methods

- `handleOrderClick(data: OrderClickData): Promise<boolean>`
- `handlePositionClick(data: PositionClickData): Promise<boolean>`
- `handleNotificationClick(data: NotificationClickData): Promise<boolean>`
- `handleChartClick(data: ChartClickData): Promise<boolean>`
- `handleNavigationClick(data: NavigationClickData): Promise<boolean>`
- `handleQuickBuy(symbol: string, mode: 'paper' | 'live'): Promise<boolean>`
- `handleQuickSell(symbol: string, mode: 'paper' | 'live'): Promise<boolean>`

### React Hooks

#### useClickHandlers()

Returns all click handler functions with loading and error states.

```tsx
const {
  handleOrderClick,
  handlePositionClick,
  handleNotificationClick,
  handleChartClick,
  handleNavigationClick,
  handleQuickBuy,
  handleQuickSell,
  isLoading,
  error,
  lastAction
} = useClickHandlers();
```

#### useOrderHandlers(mode: 'paper' | 'live')

Specialized hook for order-related actions.

```tsx
const {
  placeOrder,
  quickBuy,
  quickSell,
  isLoading,
  error
} = useOrderHandlers('paper');
```

#### usePositionHandlers()

Specialized hook for position management.

```tsx
const {
  closePosition,
  modifyPosition,
  viewPositionDetails,
  isLoading,
  error
} = usePositionHandlers();
```

#### useNotificationHandlers()

Specialized hook for notification management.

```tsx
const {
  markAsRead,
  dismiss,
  viewDetails,
  isLoading,
  error
} = useNotificationHandlers();
```

#### useChartHandlers()

Specialized hook for chart interactions.

```tsx
const {
  onPriceClick,
  onTimeframeChange,
  onSymbolChange,
  isLoading,
  error
} = useChartHandlers();
```

### React Components

#### ClickHandler

Generic click handler component with multiple variants.

```tsx
<ClickHandler
  onClick={handleClick}
  variant="hover" // 'default' | 'hover' | 'press' | 'ripple'
  disabled={false}
  loading={false}
  className="custom-class"
>
  Content
</ClickHandler>
```

#### Specialized Handlers

- `OrderClickHandler` - For order placement
- `PositionClickHandler` - For position management
- `NotificationClickHandler` - For notification actions
- `ChartClickHandler` - For chart interactions
- `NavigationClickHandler` - For navigation

## 🎯 Use Cases

### 1. Order Placement

```tsx
// Quick buy/sell buttons
const { quickBuy, quickSell } = useOrderHandlers('paper');

<button onClick={() => quickBuy('AAPL')}>Quick Buy AAPL</button>
<button onClick={() => quickSell('AAPL')}>Quick Sell AAPL</button>

// Full order form
const { placeOrder } = useOrderHandlers('paper');

const handleSubmit = async () => {
  await placeOrder('AAPL', 'buy', 10, 'limit', 150.00);
};
```

### 2. Position Management

```tsx
const { closePosition, modifyPosition } = usePositionHandlers();

<button onClick={() => closePosition('AAPL', 'pos_123')}>
  Close Position
</button>
<button onClick={() => modifyPosition('AAPL', 'pos_123')}>
  Modify Position
</button>
```

### 3. Notification Handling

```tsx
const { markAsRead, dismiss } = useNotificationHandlers();

<button onClick={() => markAsRead('notif_123')}>
  Mark as Read
</button>
<button onClick={() => dismiss('notif_123')}>
  Dismiss
</button>
```

### 4. Chart Interactions

```tsx
const { onPriceClick, onTimeframeChange } = useChartHandlers();

// Price point click
<div onClick={() => onPriceClick('AAPL', 150.25, new Date().toISOString())}>
  Price: $150.25
</div>

// Timeframe change
<button onClick={() => onTimeframeChange('AAPL', '1W')}>
  1 Week
</button>
```

### 5. Navigation

```tsx
const { handleNavigationClick } = useClickHandlers();

<button onClick={() => handleNavigationClick({
  route: '/trading',
  params: { symbol: 'AAPL', mode: 'paper' }
})}>
  Go to Trading
</button>
```

## 🔧 Configuration

### Environment Variables

The click handlers automatically use the secure configuration system for API keys:

```env
# Encrypted API keys (recommended)
ENCRYPTED_APCA_API_KEY_ID=encrypted_key_here
ENCRYPTED_APCA_API_SECRET_KEY=encrypted_secret_here
SECRET_KEY=encryption_key_here

# Or plain text keys (fallback)
APCA_API_KEY_ID=your_key_here
APCA_API_SECRET_KEY=your_secret_here
```

### API Endpoints

The system expects these API endpoints to be available:

- `POST /api/orders` - Place orders
- `POST /api/positions/:id/close` - Close positions
- `POST /api/notifications/:id/read` - Mark notifications as read
- `POST /api/notifications/:id/dismiss` - Dismiss notifications

## 🎨 Styling

### Variants

The ClickHandler component supports multiple visual variants:

- `default` - Standard button styling
- `hover` - Hover effects with scale and shadow
- `press` - Press animation with scale down
- `ripple` - Ripple effect on click

### Custom Styling

```tsx
<ClickHandler
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
  variant="hover"
>
  Custom Styled Button
</ClickHandler>
```

## 📊 Analytics

The system automatically tracks click analytics:

```tsx
import { clickHandler } from '@/lib/handlers/clickHandlers';

// Get analytics data
const analytics = clickHandler.getClickAnalytics();
console.log(analytics); // Map of action -> count

// Clear analytics
clickHandler.clearAnalytics();
```

## 🚨 Error Handling

All click handlers include comprehensive error handling:

```tsx
const { handleOrderClick, error, isLoading } = useClickHandlers();

// Error is automatically displayed via toast notifications
// Loading state is managed automatically
// Failed actions are logged to console
```

## 🧪 Testing

### Demo Page

Visit `/click-demo` to see all click handlers in action with interactive examples.

### Unit Testing

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ClickHandler } from '@/app/components/ClickHandler';

test('click handler executes callback', async () => {
  const handleClick = jest.fn();
  
  render(
    <ClickHandler onClick={handleClick}>
      Test Button
    </ClickHandler>
  );
  
  fireEvent.click(screen.getByText('Test Button'));
  
  await waitFor(() => {
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## 🔄 Migration Guide

### From Old Click Handlers

1. **Replace direct API calls**:
   ```tsx
   // Old
   const response = await fetch('/api/orders', { ... });
   
   // New
   const { placeOrder } = useOrderHandlers('paper');
   await placeOrder('AAPL', 'buy', 10);
   ```

2. **Replace manual loading states**:
   ```tsx
   // Old
   const [loading, setLoading] = useState(false);
   
   // New
   const { isLoading } = useOrderHandlers('paper');
   ```

3. **Replace manual error handling**:
   ```tsx
   // Old
   try { ... } catch (error) { setError(error.message); }
   
   // New
   const { error } = useOrderHandlers('paper');
   // Error is handled automatically
   ```

## 🎯 Best Practices

1. **Use specialized hooks** for specific use cases
2. **Wrap components** with appropriate click handlers
3. **Handle loading states** with the provided `isLoading` flag
4. **Use toast notifications** for user feedback
5. **Test click handlers** with the demo page
6. **Monitor analytics** for user interaction patterns
7. **Use encrypted API keys** for production

## 🐛 Troubleshooting

### Common Issues

1. **"API keys not configured"**
   - Check environment variables
   - Ensure encryption keys are set correctly

2. **"Network error"**
   - Check API endpoint availability
   - Verify network connectivity

3. **"Invalid order data"**
   - Validate all required fields
   - Check data types and formats

4. **Loading state not updating**
   - Ensure you're using the hook's `isLoading` state
   - Check for proper async/await usage

### Debug Mode

Enable debug logging:

```tsx
// In development
localStorage.setItem('debug', 'click-handlers');
```

## 📚 Examples

See the complete examples in:
- `/app/click-demo/page.tsx` - Interactive demo
- `/app/components/ClickHandlerDemo.tsx` - Component examples
- `/app/trading/components/OrderTicket.tsx` - Real implementation

---

**🎉 The Click Handler System is now fully implemented and ready for use!**
