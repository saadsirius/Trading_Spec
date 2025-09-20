/**
 * File: src/lib/toast/ToastService.ts
 * Description: Toast notification service.
 */
import toast from 'react-hot-toast';

export class ToastService {
  static success(message: string) {
    return toast.success(message);
  }

  static error(message: string) {
    return toast.error(message);
  }

  static warning(message: string) {
    return toast(message, {
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  }

  static info(message: string) {
    return toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    });
  }

  static loading(message: string) {
    return toast.loading(message);
  }

  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) {
    return toast.promise(promise, messages);
  }

  static dismiss(id?: string) {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }
}

// Export individual functions for convenience
export const showSuccess = ToastService.success;
export const showError = ToastService.error;
export const showWarning = ToastService.warning;
export const showInfo = ToastService.info;
export const showLoading = ToastService.loading;
export const showPromise = ToastService.promise;
export const dismissToast = ToastService.dismiss;