/**
 * File: src/components/notifications/NotificationBell.tsx
 * Purpose: Notification bell component with unread count and keyboard accessibility
 * Key dependencies: React, TailwindCSS, zustand
 * Learning Angle: This demonstrates proper accessibility patterns for notification UI,
 * including keyboard navigation, ARIA labels, and screen reader support. Notice how
 * we handle focus management and provide clear visual feedback.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotificationStore } from '@/state/notificationStore';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { 
    unreadCount, 
    notifications, 
    markAsRead, 
    dismissNotification,
    toggleNotificationCenter,
    isNotificationCenterOpen 
  } = useNotificationStore();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleBellClick = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      // Mark all notifications as read when opening
      notifications.forEach(notification => {
        if (!notification.read) {
          markAsRead(notification.id);
        }
      });
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    // In a real app, this might navigate to the relevant page
    console.log('Notification clicked:', notificationId);
  };

  const handleDismiss = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dismissNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-800';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'success':
        return 'text-emerald-400 bg-emerald-900/20 border-emerald-800';
      case 'info':
      default:
        return 'text-blue-400 bg-blue-900/20 border-blue-800';
    }
  };

  // Get recent notifications (last 5)
  const recentNotifications = notifications
    .filter(n => !n.dismissed)
    .slice(0, 5);

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleBellClick}
        className="relative p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17l2.586-2.586a2 2 0 012.828 0L12.828 17H4.828z"
          />
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17l2.586-2.586a2 2 0 012.828 0L12.828 17H4.828z" />
                </svg>
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-700/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-gray-700/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNotificationClick(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0">
                        <span className="text-lg" aria-hidden="true">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-white' : 'text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.persistent && (
                            <button
                              onClick={(e) => handleDismiss(notification.id, e)}
                              className="text-gray-400 hover:text-white transition-colors"
                              aria-label={`Dismiss notification: ${notification.title}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.symbol && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">
                            {notification.symbol}
                          </span>
                        )}
                        
                        <time 
                          className="block text-xs text-gray-500 mt-2"
                          dateTime={notification.timestamp.toISOString()}
                        >
                          {notification.timestamp.toLocaleTimeString()}
                        </time>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  toggleNotificationCenter();
                }}
                className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
