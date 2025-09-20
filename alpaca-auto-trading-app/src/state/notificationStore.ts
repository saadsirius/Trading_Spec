/**
 * File: src/state/notificationStore.ts
 * Purpose: Zustand store for notification and alert management
 * Key dependencies: zustand, immer, nanoid (for unique IDs)
 * Learning Angle: This demonstrates how to manage complex notification state with
 * deduplication, rate limiting, and different severity levels. Notice how we handle
 * quiet hours, channel preferences, and notification lifecycle management.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { nanoid } from 'nanoid';

// Types for notification system
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  symbol?: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  persistent: boolean; // Critical notifications that can't be dismissed
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface AlertRule {
  id: string;
  name: string;
  symbol: string;
  condition: {
    metric: 'price' | 'volume' | 'rsi' | 'macd' | 'donchian' | 'pnl' | 'buying_power';
    operator: '>' | '<' | '>=' | '<=' | '==' | 'crosses_above' | 'crosses_below';
    value: number;
    timeframe?: string;
  };
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    webhook: boolean;
  };
  throttleMinutes: number;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    webhook: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  severityRouting: {
    info: string[];
    warning: string[];
    critical: string[];
  };
  digest: {
    enabled: boolean;
    frequency: 'off' | 'hourly' | 'daily';
  };
}

export interface NotificationState {
  // Core state
  notifications: Notification[];
  alertRules: AlertRule[];
  settings: NotificationSettings;
  
  // UI state
  isNotificationCenterOpen: boolean;
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed'>) => void;
  markAsRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Alert rules
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  deleteAlertRule: (id: string) => void;
  toggleAlertRule: (id: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // UI actions
  toggleNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  
  // Computed values
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getUnreadNotifications: () => Notification[];
  getActiveAlertRules: () => AlertRule[];
  isInQuietHours: () => boolean;
  shouldDeliverToChannel: (notification: Notification, channel: keyof NotificationSettings['channels']) => boolean;
}

// Default settings
const defaultSettings: NotificationSettings = {
  channels: {
    inApp: true,
    email: false,
    push: false,
    webhook: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    days: [0, 1, 2, 3, 4, 5, 6], // All days
  },
  severityRouting: {
    info: ['inApp'],
    warning: ['inApp', 'email'],
    critical: ['inApp', 'email', 'push'],
  },
  digest: {
    enabled: false,
    frequency: 'off',
  },
};

export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      notifications: [],
      alertRules: [],
      settings: defaultSettings,
      isNotificationCenterOpen: false,
      unreadCount: 0,

      // Actions
      addNotification: (notificationData) => {
        set((state) => {
          const notification: Notification = {
            ...notificationData,
            id: nanoid(),
            timestamp: new Date(),
            read: false,
            dismissed: false,
          };

          // Check for duplicates (same type, symbol, and message within last 5 minutes)
          const isDuplicate = state.notifications.some(n => 
            n.type === notification.type &&
            n.symbol === notification.symbol &&
            n.message === notification.message &&
            !n.dismissed &&
            (Date.now() - n.timestamp.getTime()) < 5 * 60 * 1000 // 5 minutes
          );

          if (!isDuplicate) {
            state.notifications.unshift(notification);
            state.unreadCount = state.notifications.filter(n => !n.read).length;
          }
        });
      },

      markAsRead: (id: string) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadCount = state.notifications.filter(n => !n.read).length;
          }
        });
      },

      dismissNotification: (id: string) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.persistent) {
            notification.dismissed = true;
            if (!notification.read) {
              state.unreadCount = state.notifications.filter(n => !n.read).length;
            }
          }
        });
      },

      clearAllNotifications: () => {
        set((state) => {
          state.notifications = [];
          state.unreadCount = 0;
        });
      },

      // Alert rules
      addAlertRule: (ruleData) => {
        set((state) => {
          const rule: AlertRule = {
            ...ruleData,
            id: nanoid(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          state.alertRules.push(rule);
        });
      },

      updateAlertRule: (id: string, updates: Partial<AlertRule>) => {
        set((state) => {
          const rule = state.alertRules.find(r => r.id === id);
          if (rule) {
            Object.assign(rule, updates);
            rule.updatedAt = new Date();
          }
        });
      },

      deleteAlertRule: (id: string) => {
        set((state) => {
          state.alertRules = state.alertRules.filter(r => r.id !== id);
        });
      },

      toggleAlertRule: (id: string) => {
        set((state) => {
          const rule = state.alertRules.find(r => r.id === id);
          if (rule) {
            rule.enabled = !rule.enabled;
            rule.updatedAt = new Date();
          }
        });
      },

      // Settings
      updateSettings: (updates: Partial<NotificationSettings>) => {
        set((state) => {
          Object.assign(state.settings, updates);
        });
      },

      // UI actions
      toggleNotificationCenter: () => {
        set((state) => {
          state.isNotificationCenterOpen = !state.isNotificationCenterOpen;
        });
      },

      closeNotificationCenter: () => {
        set((state) => {
          state.isNotificationCenterOpen = false;
        });
      },

      // Computed values
      getNotificationsByType: (type: Notification['type']) => {
        const state = get();
        return state.notifications.filter(n => n.type === type && !n.dismissed);
      },

      getUnreadNotifications: () => {
        const state = get();
        return state.notifications.filter(n => !n.read && !n.dismissed);
      },

      getActiveAlertRules: () => {
        const state = get();
        return state.alertRules.filter(r => r.enabled);
      },

      isInQuietHours: () => {
        const state = get();
        const { quietHours } = state.settings;
        
        if (!quietHours.enabled) return false;

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Check if current day is in quiet hours days
        if (!quietHours.days.includes(currentDay)) return false;

        const startTime = parseInt(quietHours.start.split(':')[0]) * 60 + parseInt(quietHours.start.split(':')[1]);
        const endTime = parseInt(quietHours.end.split(':')[0]) * 60 + parseInt(quietHours.end.split(':')[1]);

        // Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if (startTime > endTime) {
          return currentTime >= startTime || currentTime <= endTime;
        } else {
          return currentTime >= startTime && currentTime <= endTime;
        }
      },

      shouldDeliverToChannel: (notification: Notification, channel: keyof NotificationSettings['channels']) => {
        const state = get();
        const { settings } = state;
        
        // Check if channel is enabled
        if (!settings.channels[channel]) return false;
        
        // Check if notification type is routed to this channel
        const routedChannels = settings.severityRouting[notification.type] || [];
        if (!routedChannels.includes(channel)) return false;
        
        // Check quiet hours (except for critical notifications)
        if (notification.type !== 'critical' && state.isInQuietHours()) {
          return false;
        }
        
        return true;
      },
    })),
    {
      name: 'notification-store', // For Redux DevTools
    }
  )
);
