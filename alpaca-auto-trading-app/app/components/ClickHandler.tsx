'use client';

import React, { ReactNode, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { useClickHandlers } from '@/lib/hooks/useClickHandlers';

interface ClickHandlerProps {
  children: ReactNode;
  onClick?: (event: MouseEvent) => void;
  onOrderClick?: (data: any) => void;
  onPositionClick?: (data: any) => void;
  onNotificationClick?: (data: any) => void;
  onChartClick?: (data: any) => void;
  onNavigationClick?: (data: any) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'hover' | 'press' | 'ripple';
  data?: any;
}

export const ClickHandler: React.FC<ClickHandlerProps> = ({
  children,
  onClick,
  onOrderClick,
  onPositionClick,
  onNotificationClick,
  onChartClick,
  onNavigationClick,
  disabled = false,
  loading = false,
  className = '',
  variant = 'default',
  data
}) => {
  const { 
    handleOrderClick, 
    handlePositionClick, 
    handleNotificationClick, 
    handleChartClick, 
    handleNavigationClick,
    isLoading 
  } = useClickHandlers();

  const handleClick = async (event: MouseEvent) => {
    if (disabled || loading || isLoading) {
      event.preventDefault();
      return;
    }

    // Execute custom onClick first
    if (onClick) {
      onClick(event);
    }

    // Execute specific handlers based on data type
    try {
      if (onOrderClick && data) {
        await onOrderClick(data);
      } else if (onPositionClick && data) {
        await onPositionClick(data);
      } else if (onNotificationClick && data) {
        await onNotificationClick(data);
      } else if (onChartClick && data) {
        await onChartClick(data);
      } else if (onNavigationClick && data) {
        await onNavigationClick(data);
      }
    } catch (error) {
      console.error('Click handler error:', error);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'hover':
        return 'hover:scale-105 hover:shadow-lg transition-all duration-200';
      case 'press':
        return 'active:scale-95 transition-transform duration-100';
      case 'ripple':
        return 'relative overflow-hidden';
      default:
        return 'transition-colors duration-200';
    }
  };

  const getDisabledClasses = () => {
    if (disabled || loading || isLoading) {
      return 'opacity-50 cursor-not-allowed pointer-events-none';
    }
    return 'cursor-pointer';
  };

  const MotionComponent = variant === 'ripple' ? motion.div : motion.button;

  return (
    <MotionComponent
      onClick={handleClick}
      className={`${getVariantClasses()} ${getDisabledClasses()} ${className}`}
      disabled={disabled || loading || isLoading}
      whileHover={!disabled && !loading && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading && !isLoading ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
      {loading || isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      ) : null}
    </MotionComponent>
  );
};

// Specialized click handler components
export const OrderClickHandler: React.FC<{
  children: ReactNode;
  orderData: any;
  onSuccess?: () => void;
  className?: string;
}> = ({ children, orderData, onSuccess, className }) => {
  const { handleOrderClick } = useClickHandlers();

  const handleOrder = async (data: any) => {
    const success = await handleOrderClick(data);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <ClickHandler
      onOrderClick={handleOrder}
      data={orderData}
      className={className}
    >
      {children}
    </ClickHandler>
  );
};

export const PositionClickHandler: React.FC<{
  children: ReactNode;
  positionData: any;
  onSuccess?: () => void;
  className?: string;
}> = ({ children, positionData, onSuccess, className }) => {
  const { handlePositionClick } = useClickHandlers();

  const handlePosition = async (data: any) => {
    const success = await handlePositionClick(data);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <ClickHandler
      onPositionClick={handlePosition}
      data={positionData}
      className={className}
    >
      {children}
    </ClickHandler>
  );
};

export const NotificationClickHandler: React.FC<{
  children: ReactNode;
  notificationData: any;
  onSuccess?: () => void;
  className?: string;
}> = ({ children, notificationData, onSuccess, className }) => {
  const { handleNotificationClick } = useClickHandlers();

  const handleNotification = async (data: any) => {
    const success = await handleNotificationClick(data);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <ClickHandler
      onNotificationClick={handleNotification}
      data={notificationData}
      className={className}
    >
      {children}
    </ClickHandler>
  );
};

export const ChartClickHandler: React.FC<{
  children: ReactNode;
  chartData: any;
  onSuccess?: () => void;
  className?: string;
}> = ({ children, chartData, onSuccess, className }) => {
  const { handleChartClick } = useClickHandlers();

  const handleChart = async (data: any) => {
    const success = await handleChartClick(data);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <ClickHandler
      onChartClick={handleChart}
      data={chartData}
      className={className}
    >
      {children}
    </ClickHandler>
  );
};

export const NavigationClickHandler: React.FC<{
  children: ReactNode;
  navigationData: any;
  onSuccess?: () => void;
  className?: string;
}> = ({ children, navigationData, onSuccess, className }) => {
  const { handleNavigationClick } = useClickHandlers();

  const handleNavigation = async (data: any) => {
    const success = await handleNavigationClick(data);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <ClickHandler
      onNavigationClick={handleNavigation}
      data={navigationData}
      className={className}
    >
      {children}
    </ClickHandler>
  );
};
