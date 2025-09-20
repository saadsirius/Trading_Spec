'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast, Toast } from 'react-hot-toast';

interface ToastContextType {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  loading: (message: string, title?: string) => string;
  dismiss: (toastId?: string) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const success = useCallback((message: string, title?: string) => {
    toast.success(title ? `${title}: ${message}` : message);
  }, []);

  const error = useCallback((message: string, title?: string) => {
    toast.error(title ? `${title}: ${message}` : message);
  }, []);

  const info = useCallback((message: string, title?: string) => {
    toast(title ? `${title}: ${message}` : message, {
      icon: 'ℹ️',
    });
  }, []);

  const warning = useCallback((message: string, title?: string) => {
    toast(title ? `${title}: ${message}` : message, {
      icon: '⚠️',
    });
  }, []);

  const loading = useCallback((message: string, title?: string) => {
    return toast.loading(title ? `${title}: ${message}` : message);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  const promise = useCallback(<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  }, []);

  return (
    <ToastContext.Provider value={{
      success,
      error,
      info,
      warning,
      loading,
      dismiss,
      promise,
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Static API for use outside React components
export const Toasts = {
  success: (message: string, title?: string) => {
    toast.success(title ? `${title}: ${message}` : message);
  },
  error: (message: string, title?: string) => {
    toast.error(title ? `${title}: ${message}` : message);
  },
  info: (message: string, title?: string) => {
    toast(title ? `${title}: ${message}` : message, {
      icon: 'ℹ️',
    });
  },
  warning: (message: string, title?: string) => {
    toast(title ? `${title}: ${message}` : message, {
      icon: '⚠️',
    });
  },
  loading: (message: string, title?: string) => {
    return toast.loading(title ? `${title}: ${message}` : message);
  },
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

export function ToastViewport() {
  return (
    <div className="fixed top-0 right-0 z-50 p-4">
      {/* Toast container will be rendered here by react-hot-toast */}
    </div>
  );
}
