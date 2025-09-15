"use client";

import { motion } from 'framer-motion';
import { Bell, ExternalLink } from 'lucide-react';
import { NotificationRow } from '@/lib/types/overview';

interface NotificationTrayProps {
  notifications: NotificationRow[];
  mode: 'paper' | 'live';
}

export function NotificationTray({ notifications, mode }: NotificationTrayProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('filled')) return '✅';
    if (title.toLowerCase().includes('opened')) return '📈';
    if (title.toLowerCase().includes('closed')) return '📉';
    if (title.toLowerCase().includes('error')) return '⚠️';
    return '📢';
  };

  const handleNotificationClick = (notification: NotificationRow) => {
    // In a real app, this would navigate to the href
    console.log('Navigate to:', notification.href);
    // For demo, we'll just log it
  };

  if (!notifications.length) {
    return (
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <Bell className="w-5 h-5 text-white/40" />
        </div>
        
        <div className="h-48 flex items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">🔔</div>
            <p>No notifications</p>
            <p className="text-sm mt-1">
              Trade activity will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/60">{notifications.length} recent</span>
          <Bell className="w-5 h-5 text-white/40" />
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleNotificationClick(notification)}
            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-start space-x-3">
              <div className="text-lg flex-shrink-0">
                {getNotificationIcon(notification.title)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium leading-relaxed">
                  {notification.title}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/60">
                    {formatTime(notification.t)}
                  </span>
                  
                  <ExternalLink className="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button className="text-sm text-secondary hover:text-secondary/80 transition-colors">
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
}
