/**
 * File: src/state/__tests__/uiStore.test.ts
 * Description: Tests for UI store functionality.
 */
import { useUIStore } from '../uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      theme: 'dark',
      sidebarOpen: false,
      modals: {},
      loading: {},
      notifications: [],
      searchQuery: '',
      filters: {},
    });
  });

  describe('theme management', () => {
    it('should have dark theme by default', () => {
      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should set theme to light', () => {
      useUIStore.getState().setTheme('light');
      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
    });

    it('should set theme to dark', () => {
      useUIStore.getState().setTheme('dark');
      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
    });
  });

  describe('sidebar management', () => {
    it('should have sidebar closed by default', () => {
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(false);
    });

    it('should open sidebar', () => {
      useUIStore.getState().setSidebarOpen(true);
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });

    it('should close sidebar', () => {
      useUIStore.getState().setSidebarOpen(false);
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(false);
    });
  });

  describe('modal management', () => {
    it('should have empty modals by default', () => {
      const state = useUIStore.getState();
      expect(state.modals).toEqual({});
    });

    it('should open a modal', () => {
      useUIStore.getState().openModal('test-modal');
      const state = useUIStore.getState();
      expect(state.modals['test-modal']).toBe(true);
    });

    it('should close a modal', () => {
      useUIStore.getState().openModal('test-modal');
      useUIStore.getState().closeModal('test-modal');
      const state = useUIStore.getState();
      expect(state.modals['test-modal']).toBe(false);
    });

    it('should handle multiple modals', () => {
      useUIStore.getState().openModal('modal1');
      useUIStore.getState().openModal('modal2');
      const state = useUIStore.getState();
      expect(state.modals['modal1']).toBe(true);
      expect(state.modals['modal2']).toBe(true);
    });
  });

  describe('loading state management', () => {
    it('should have empty loading states by default', () => {
      const state = useUIStore.getState();
      expect(state.loading).toEqual({});
    });

    it('should set loading state', () => {
      useUIStore.getState().setLoading('test-key', true);
      const state = useUIStore.getState();
      expect(state.loading['test-key']).toBe(true);
    });

    it('should unset loading state', () => {
      useUIStore.getState().setLoading('test-key', true);
      useUIStore.getState().setLoading('test-key', false);
      const state = useUIStore.getState();
      expect(state.loading['test-key']).toBe(false);
    });

    it('should handle multiple loading states', () => {
      useUIStore.getState().setLoading('key1', true);
      useUIStore.getState().setLoading('key2', false);
      const state = useUIStore.getState();
      expect(state.loading['key1']).toBe(true);
      expect(state.loading['key2']).toBe(false);
    });
  });

  describe('notification management', () => {
    it('should have empty notifications by default', () => {
      const state = useUIStore.getState();
      expect(state.notifications).toEqual([]);
    });

    it('should add a notification', () => {
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Test notification',
      });
      const state = useUIStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].type).toBe('success');
      expect(state.notifications[0].message).toBe('Test notification');
      expect(state.notifications[0].id).toBeDefined();
      expect(state.notifications[0].timestamp).toBeDefined();
    });

    it('should remove a notification', () => {
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Test notification',
      });
      const state = useUIStore.getState();
      const notificationId = state.notifications[0].id;
      
      useUIStore.getState().removeNotification(notificationId);
      const newState = useUIStore.getState();
      expect(newState.notifications).toHaveLength(0);
    });

    it('should handle multiple notifications', () => {
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Success notification',
      });
      useUIStore.getState().addNotification({
        type: 'error',
        message: 'Error notification',
      });
      const state = useUIStore.getState();
      expect(state.notifications).toHaveLength(2);
      expect(state.notifications[0].type).toBe('success');
      expect(state.notifications[1].type).toBe('error');
    });
  });

  describe('search management', () => {
    it('should have empty search query by default', () => {
      const state = useUIStore.getState();
      expect(state.searchQuery).toBe('');
    });

    it('should set search query', () => {
      useUIStore.getState().setSearchQuery('test query');
      const state = useUIStore.getState();
      expect(state.searchQuery).toBe('test query');
    });

    it('should update search query', () => {
      useUIStore.getState().setSearchQuery('initial query');
      useUIStore.getState().setSearchQuery('updated query');
      const state = useUIStore.getState();
      expect(state.searchQuery).toBe('updated query');
    });
  });

  describe('filter management', () => {
    it('should have empty filters by default', () => {
      const state = useUIStore.getState();
      expect(state.filters).toEqual({});
    });

    it('should set a filter', () => {
      useUIStore.getState().setFilter('category', 'stocks');
      const state = useUIStore.getState();
      expect(state.filters['category']).toBe('stocks');
    });

    it('should update a filter', () => {
      useUIStore.getState().setFilter('category', 'stocks');
      useUIStore.getState().setFilter('category', 'crypto');
      const state = useUIStore.getState();
      expect(state.filters['category']).toBe('crypto');
    });

    it('should handle multiple filters', () => {
      useUIStore.getState().setFilter('category', 'stocks');
      useUIStore.getState().setFilter('price', 'high');
      const state = useUIStore.getState();
      expect(state.filters['category']).toBe('stocks');
      expect(state.filters['price']).toBe('high');
    });

    it('should clear all filters', () => {
      useUIStore.getState().setFilter('category', 'stocks');
      useUIStore.getState().setFilter('price', 'high');
      useUIStore.getState().clearFilters();
      const state = useUIStore.getState();
      expect(state.filters).toEqual({});
    });
  });
});