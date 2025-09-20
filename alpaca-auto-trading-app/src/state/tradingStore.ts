/**
 * File: src/state/tradingStore.ts
 * Purpose: Zustand store for trading dashboard state management
 * Key dependencies: zustand, immer (for immutable updates)
 * Learning Angle: This demonstrates how to structure a complex trading state store with
 * proper separation of concerns, optimistic updates, and error handling. Notice how we
 * use immer for immutable updates and separate actions by domain.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

// Types for trading data structures
export interface Account {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  non_marginable_buying_power: string;
  cash: string;
  accrued_fees: string;
  pending_transfer_out: string;
  pending_transfer_in: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  trade_suspended_by_user: boolean;
  multiplier: string;
  shorting_enabled: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  sma: string;
  daytrade_count: number;
}

export interface Position {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: 'long' | 'short';
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

export interface Order {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at?: string;
  expired_at?: string;
  canceled_at?: string;
  failed_at?: string;
  replaced_at?: string;
  replaced_by?: string;
  replaces?: string;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional?: string;
  qty?: string;
  filled_qty: string;
  filled_avg_price?: string;
  order_class: string;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  side: 'buy' | 'sell';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: string;
  stop_price?: string;
  status: 'new' | 'partially_filled' | 'filled' | 'done_for_day' | 'canceled' | 'expired' | 'replaced' | 'pending_cancel' | 'pending_replace' | 'accepted' | 'pending_new' | 'accepted_for_bidding' | 'stopped' | 'rejected' | 'suspended' | 'calculated';
  extended_hours: boolean;
  legs?: any[];
  trail_percent?: string;
  trail_price?: string;
  hwm?: string;
}

export interface TradingState {
  // Core state
  mode: 'paper' | 'live';
  selectedSymbol: string;
  isConnected: boolean;
  lastUpdate: Date | null;
  
  // Data
  account: Account | null;
  positions: Position[];
  orders: Order[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  switchMode: (mode: 'paper' | 'live') => Promise<void>;
  updateAccount: (account: Account | null) => void;
  updatePositions: (positions: Position[]) => void;
  updateOrders: (orders: Order[]) => void;
  setSelectedSymbol: (symbol: string) => void;
  setConnectionStatus: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed values
  getTotalEquity: () => number;
  getTotalPnL: () => number;
  getBuyingPower: () => number;
  getPositionBySymbol: (symbol: string) => Position | undefined;
  getOpenOrdersBySymbol: (symbol: string) => Order[];
}

export const useTradingStore = create<TradingState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      mode: 'paper',
      selectedSymbol: 'SPY',
      isConnected: false,
      lastUpdate: null,
      account: null,
      positions: [],
      orders: [],
      isLoading: false,
      error: null,

      // Actions
      switchMode: async (mode: 'paper' | 'live') => {
        set((state) => {
          state.mode = mode;
          state.error = null;
        });
        
        // In a real implementation, this would make an API call to switch modes
        // For now, we just update the local state
        console.log(`Switched to ${mode} trading mode`);
      },

      updateAccount: (account: Account | null) => {
        set((state) => {
          state.account = account;
          state.lastUpdate = new Date();
        });
      },

      updatePositions: (positions: Position[]) => {
        set((state) => {
          state.positions = positions;
          state.lastUpdate = new Date();
        });
      },

      updateOrders: (orders: Order[]) => {
        set((state) => {
          state.orders = orders;
          state.lastUpdate = new Date();
        });
      },

      setSelectedSymbol: (symbol: string) => {
        set((state) => {
          state.selectedSymbol = symbol;
        });
      },

      setConnectionStatus: (connected: boolean) => {
        set((state) => {
          state.isConnected = connected;
        });
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      // Computed values
      getTotalEquity: () => {
        const account = get().account;
        return account ? parseFloat(account.equity || '0') : 0;
      },

      getTotalPnL: () => {
        const positions = get().positions;
        return positions.reduce((total, position) => {
          return total + parseFloat(position.unrealized_pl || '0');
        }, 0);
      },

      getBuyingPower: () => {
        const account = get().account;
        return account ? parseFloat(account.buying_power || '0') : 0;
      },

      getPositionBySymbol: (symbol: string) => {
        const positions = get().positions;
        return positions.find(position => position.symbol === symbol);
      },

      getOpenOrdersBySymbol: (symbol: string) => {
        const orders = get().orders;
        return orders.filter(order => 
          order.symbol === symbol && 
          ['new', 'partially_filled', 'pending_new', 'accepted'].includes(order.status)
        );
      },
    })),
    {
      name: 'trading-store', // For Redux DevTools
    }
  )
);
