import { renderHook, act } from '@testing-library/react';
import { useUIStore } from '../uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      isNavbarVisible: true,
      isNavbarSticky: false,
      isMobileMenuOpen: false,
      isDarkMode: false,
      sidebarCollapsed: false,
      notifications: [],
      loading: false,
      error: null,
    });
  });

  describe('navbar state', () => {
    it('should toggle navbar visibility', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.isNavbarVisible).toBe(true);
      
      act(() => {
        result.current.toggleNavbar();
      });
      
      expect(result.current.isNavbarVisible).toBe(false);
    });

    it('should set navbar sticky state', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.isNavbarSticky).toBe(false);
      
      act(() => {
        result.current.setNavbarSticky(true);
      });
      
      expect(result.current.isNavbarSticky).toBe(true);
    });
  });

  describe('mobile menu state', () => {
    it('should toggle mobile menu', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.isMobileMenuOpen).toBe(false);
      
      act(() => {
        result.current.toggleMobileMenu();
      });
      
      expect(result.current.isMobileMenuOpen).toBe(true);
    });

    it('should close mobile menu', () => {
      const { result } = renderHook(() => useUIStore());
      
      // First open the menu
      act(() => {
        result.current.toggleMobileMenu();
      });
      
      expect(result.current.isMobileMenuOpen).toBe(true);
      
      // Then close it
      act(() => {
        result.current.closeMobileMenu();
      });
      
      expect(result.current.isMobileMenuOpen).toBe(false);
    });
  });

  describe('theme state', () => {
    it('should toggle dark mode', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.isDarkMode).toBe(false);
      
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(result.current.isDarkMode).toBe(true);
    });

    it('should set dark mode', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setDarkMode(true);
      });
      
      expect(result.current.isDarkMode).toBe(true);
    });
  });

  describe('sidebar state', () => {
    it('should toggle sidebar', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.sidebarCollapsed).toBe(false);
      
      act(() => {
        result.current.toggleSidebar();
      });
      
      expect(result.current.sidebarCollapsed).toBe(true);
    });

    it('should set sidebar collapsed state', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setSidebarCollapsed(true);
      });
      
      expect(result.current.sidebarCollapsed).toBe(true);
    });
  });

  describe('notifications', () => {
    it('should add notification', () => {
      const { result } = renderHook(() => useUIStore());
      
      const notification = {
        id: '1',
        type: 'success' as const,
        message: 'Test notification',
        timestamp: Date.now(),
      };
      
      act(() => {
        result.current.addNotification(notification);
      });
      
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toEqual(notification);
    });

    it('should remove notification', () => {
      const { result } = renderHook(() => useUIStore());
      
      const notification = {
        id: '1',
        type: 'success' as const,
        message: 'Test notification',
        timestamp: Date.now(),
      };
      
      // Add notification first
      act(() => {
        result.current.addNotification(notification);
      });
      
      expect(result.current.notifications).toHaveLength(1);
      
      // Then remove it
      act(() => {
        result.current.removeNotification('1');
      });
      
      expect(result.current.notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useUIStore());
      
      const notifications = [
        {
          id: '1',
          type: 'success' as const,
          message: 'Test notification 1',
          timestamp: Date.now(),
        },
        {
          id: '2',
          type: 'error' as const,
          message: 'Test notification 2',
          timestamp: Date.now(),
        },
      ];
      
      // Add notifications
      act(() => {
        notifications.forEach(notification => {
          result.current.addNotification(notification);
        });
      });
      
      expect(result.current.notifications).toHaveLength(2);
      
      // Clear all
      act(() => {
        result.current.clearNotifications();
      });
      
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('loading state', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.loading).toBe(false);
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
    });
  });

  describe('error state', () => {
    it('should set error', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.error).toBe(null);
      
      const error = new Error('Test error');
      
      act(() => {
        result.current.setError(error);
      });
      
      expect(result.current.error).toBe(error);
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useUIStore());
      
      const error = new Error('Test error');
      
      // Set error first
      act(() => {
        result.current.setError(error);
      });
      
      expect(result.current.error).toBe(error);
      
      // Then clear it
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('combined actions', () => {
    it('should handle multiple state changes', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.toggleNavbar();
        result.current.toggleDarkMode();
        result.current.setLoading(true);
      });
      
      expect(result.current.isNavbarVisible).toBe(false);
      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.loading).toBe(true);
    });

    it('should maintain state consistency', () => {
      const { result } = renderHook(() => useUIStore());
      
      // Set initial state
      act(() => {
        result.current.setNavbarSticky(true);
        result.current.setDarkMode(true);
        result.current.setSidebarCollapsed(true);
      });
      
      // Verify state is maintained
      expect(result.current.isNavbarSticky).toBe(true);
      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.sidebarCollapsed).toBe(true);
      
      // Toggle some states
      act(() => {
        result.current.toggleNavbar();
        result.current.toggleSidebar();
      });
      
      // Verify toggles work correctly
      expect(result.current.isNavbarVisible).toBe(false);
      expect(result.current.sidebarCollapsed).toBe(false);
      
      // Verify other states remain unchanged
      expect(result.current.isNavbarSticky).toBe(true);
      expect(result.current.isDarkMode).toBe(true);
    });
  });
});
