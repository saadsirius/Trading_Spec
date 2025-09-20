/**
 * File: src/components/notifications/ToastRail.tsx
 * Purpose: Toast notification rail for displaying temporary messages
 * Key dependencies: React, TailwindCSS, zustand, framer-motion
 * Learning Angle: This demonstrates how to create accessible toast notifications with
 * proper ARIA live regions, auto-dismissal, and smooth animations. Notice how we
 * handle different severity levels and provide clear action buttons.
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/state/notificationStore';

interface Toast {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

interface ToastRailProps {
  className?: string;
}

export default function ToastRail({ className = '' }: ToastRailProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { addNotification } = useNotificationStore();

  // Auto-dismiss toasts after duration
  useEffect(() => {
    toasts.forEach((toast) => {
      if (!toast.persistent && toast.duration !== 0) {
        const timer = setTimeout(() => {
          dismissToast(toast.id);
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Also add to notification store for persistence
    addNotification({
      type: toast.type,
      title: toast.title,
      message: toast.message,
      persistent: toast.persistent || false,
    });
  };

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-900/90 border-red-700',
          icon: '🚨',
          iconColor: 'text-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900/90 border-yellow-700',
          icon: '⚠️',
          iconColor: 'text-yellow-400',
        };
      case 'success':
        return {
          bg: 'bg-emerald-900/90 border-emerald-700',
          icon: '✅',
          iconColor: 'text-emerald-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-900/90 border-blue-700',
          icon: 'ℹ️',
          iconColor: 'text-blue-400',
        };
    }
  };

  const getButtonStyles = (variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'primary':
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`max-w-sm w-full ${styles.bg} border rounded-lg shadow-lg backdrop-blur-sm`}
              role={toast.type === 'critical' ? 'alert' : 'status'}
              aria-live={toast.type === 'critical' ? 'assertive' : 'polite'}
              aria-atomic="true"
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <span className={`text-lg ${styles.iconColor}`} aria-hidden="true">
                      {styles.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white">
                      {toast.title}
                    </h4>
                    <p className="text-sm text-gray-300 mt-1">
                      {toast.message}
                    </p>

                    {/* Actions */}
                    {toast.actions && toast.actions.length > 0 && (
                      <div className="flex space-x-2 mt-3">
                        {toast.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${getButtonStyles(action.variant)}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dismiss Button */}
                  {!toast.persistent && (
                    <button
                      onClick={() => dismissToast(toast.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                      aria-label="Dismiss notification"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar for Auto-dismiss */}
              {!toast.persistent && toast.duration !== 0 && (
                <motion.div
                  className="h-1 bg-white/20"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Export a function to add toasts from anywhere in the app
export const toast = {
  info: (title: string, message: string, options?: Partial<Toast>) => {
    // This would be implemented with a global toast manager
    console.log('Toast info:', title, message, options);
  },
  success: (title: string, message: string, options?: Partial<Toast>) => {
    console.log('Toast success:', title, message, options);
  },
  warning: (title: string, message: string, options?: Partial<Toast>) => {
    console.log('Toast warning:', title, message, options);
  },
  critical: (title: string, message: string, options?: Partial<Toast>) => {
    console.log('Toast critical:', title, message, options);
  },
};
