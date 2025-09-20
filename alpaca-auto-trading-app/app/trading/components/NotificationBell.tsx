// components/notifications/NotificationBell.tsx
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;  // ISO
  read: boolean;
}

interface NotificationBellProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

const isBrowser = typeof window !== 'undefined';

export const NotificationBell = ({
  notifications,
  onNotificationClick,
  onMarkAllRead,
}: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0); // for keyboard nav

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // SSR-safe permission check
  useEffect(() => {
    if (!isBrowser) return;
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isBrowser || !('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setHasPermission(perm === 'granted');
    } catch {
      // ignore
    }
  }, []);

  // Outside click to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Esc to close, simple roving focus
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
        btnRef.current?.focus();
      } else if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setActiveIndex((idx) => {
          const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
          const len = notifications.length;
          if (len === 0) return 0;
          return (next + len) % len;
        });
      } else if (e.key === 'Enter') {
        const n = notifications[activeIndex];
        if (n) {
          onNotificationClick(n);
          setIsOpen(false);
          btnRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, notifications, activeIndex, onNotificationClick]);

  // Return focus to bell when the panel closes
  useEffect(() => {
    if (!isOpen) btnRef.current?.focus();
  }, [isOpen]);

  const handleBellClick = async () => {
    if (!hasPermission) {
      await requestPermission();
      // If permission granted now, open the panel
      if (isBrowser && 'Notification' in window && Notification.permission === 'granted') {
        setIsOpen((v) => !v);
      }
    } else {
      setIsOpen((v) => !v);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    setIsOpen(false);
  };

  // (Optional) show a native desktop notification when a new unread appears
  // – very basic; gate on permission + new unread count
  const prevUnreadRef = useRef(unreadCount);
  useEffect(() => {
    if (!isBrowser || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (unreadCount > prevUnreadRef.current) {
      const latest = notifications.find((n) => !n.read);
      if (latest) {
        new Notification(latest.title, { body: latest.message });
      }
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, notifications]);

  // Portal target (avoids z-index stacking issues under overflow containers)
  const portalTarget = isBrowser ? document.body : null;

  return (
    <div className="relative">
      <Button
        ref={btnRef as any}
        variant="secondary"
        size="sm"
        onClick={handleBellClick}
        className="relative"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="notifications-panel"
        title={hasPermission ? 'Notifications' : 'Enable desktop notifications'}
      >
        {hasPermission ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1">
            {/* ping ring behind */}
            <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-500 opacity-75 animate-ping" />
            {/* solid badge on top */}
            <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-white text-[10px] font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </Button>

      {/* Panel (via portal for robustness) */}
      {portalTarget &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                role="menu"
                id="notifications-panel"
                ref={panelRef}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="fixed z-[60] mt-2 w-80 right-4 top-14 bg-white rounded-lg shadow-lg border border-gray-200"
                aria-label="Notifications"
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onMarkAllRead}
                      aria-label="Mark all notifications as read"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {notifications.map((notification, i) => {
                        const isActive = i === activeIndex;
                        return (
                          <li key={notification.id}>
                            <motion.button
                              type="button"
                              role="menuitem"
                              tabIndex={0}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`w-full text-left p-4 transition-colors focus:outline-none ${
                                isActive ? 'bg-gray-100' : ''
                              } ${!notification.read ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                              onClick={() => handleNotificationClick(notification)}
                              onMouseEnter={() => setActiveIndex(i)}
                            >
                              <div className="flex items-start space-x-3">
                                <span
                                  aria-hidden
                                  className={`mt-2 h-2 w-2 rounded-full ${
                                    notification.type === 'success'
                                      ? 'bg-green-500'
                                      : notification.type === 'warning'
                                      ? 'bg-yellow-500'
                                      : notification.type === 'error'
                                      ? 'bg-red-500'
                                      : 'bg-blue-500'
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4
                                      className={`text-sm font-medium ${
                                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                                      }`}
                                    >
                                      {notification.title}
                                    </h4>
                                    <time
                                      className="text-xs text-gray-500 shrink-0"
                                      dateTime={notification.timestamp}
                                      title={new Date(notification.timestamp).toLocaleString()}
                                    >
                                      {new Date(notification.timestamp).toLocaleTimeString()}
                                    </time>
                                  </div>
                                  <p
                                    className={`text-sm mt-1 truncate ${
                                      !notification.read ? 'text-gray-700' : 'text-gray-500'
                                    }`}
                                  >
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </motion.button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          portalTarget
        )}
    </div>
  );
};