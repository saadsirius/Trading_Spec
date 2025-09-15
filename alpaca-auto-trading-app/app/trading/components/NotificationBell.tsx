'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface NotificationBellProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

export const NotificationBell = ({ 
  notifications, 
  onNotificationClick, 
  onMarkAllRead 
}: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
    }
  };

  const handleBellClick = () => {
    if (!hasPermission) {
      requestPermission();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleBellClick}
        className="relative"
      >
        {hasPermission ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-ping"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onMarkAllRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${
                            !notification.read ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
      </AnimatePresence>
    </div>
  );
};
