/**
 * File: src/lib/__tests__/shortcuts.test.ts
 * Description: Tests for keyboard shortcuts functionality.
 */
import { ShortcutManager, ShortcutConfig } from '../shortcuts';

describe('ShortcutManager', () => {
  let shortcutManager: ShortcutManager;
  let mockAction: jest.Mock;

  beforeEach(() => {
    shortcutManager = new ShortcutManager();
    mockAction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a shortcut successfully', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        action: mockAction,
        description: 'Test shortcut',
      };

      shortcutManager.register(shortcut);
      const shortcuts = shortcutManager.getShortcuts();
      
      expect(shortcuts).toHaveLength(1);
      expect(shortcuts[0]).toEqual(shortcut);
    });

    it('should register multiple shortcuts', () => {
      const shortcuts: ShortcutConfig[] = [
        { key: 'a', action: mockAction, description: 'Shortcut A' },
        { key: 'b', action: mockAction, description: 'Shortcut B' },
        { key: 'c', action: mockAction, description: 'Shortcut C' },
      ];

      shortcuts.forEach(shortcut => shortcutManager.register(shortcut));
      const registeredShortcuts = shortcutManager.getShortcuts();
      
      expect(registeredShortcuts).toHaveLength(3);
    });
  });

  describe('unregister', () => {
    it('should unregister a shortcut successfully', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        action: mockAction,
        description: 'Test shortcut',
      };

      shortcutManager.register(shortcut);
      expect(shortcutManager.getShortcuts()).toHaveLength(1);

      shortcutManager.unregister('a');
      expect(shortcutManager.getShortcuts()).toHaveLength(0);
    });

    it('should handle unregistering non-existent shortcut', () => {
      expect(() => shortcutManager.unregister('nonexistent')).not.toThrow();
    });
  });

  describe('enable/disable', () => {
    it('should enable shortcuts by default', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        action: mockAction,
        description: 'Test shortcut',
      };

      shortcutManager.register(shortcut);
      
      // Simulate keydown event
      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should disable shortcuts when disabled', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        action: mockAction,
        description: 'Test shortcut',
      };

      shortcutManager.register(shortcut);
      shortcutManager.disable();
      
      // Simulate keydown event
      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should re-enable shortcuts when enabled', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        action: mockAction,
        description: 'Test shortcut',
      };

      shortcutManager.register(shortcut);
      shortcutManager.disable();
      shortcutManager.enable();
      
      // Simulate keydown event
      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });
  });

  describe('modifier keys', () => {
    it('should handle Ctrl modifier', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        ctrl: true,
        action: mockAction,
        description: 'Ctrl+A shortcut',
      };

      shortcutManager.register(shortcut);
      
      // Simulate Ctrl+A keydown event
      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should handle Alt modifier', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        alt: true,
        action: mockAction,
        description: 'Alt+A shortcut',
      };

      shortcutManager.register(shortcut);
      
      // Simulate Alt+A keydown event
      const event = new KeyboardEvent('keydown', { key: 'a', altKey: true });
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should handle Shift modifier', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        shift: true,
        action: mockAction,
        description: 'Shift+A shortcut',
      };

      shortcutManager.register(shortcut);
      
      // Simulate Shift+A keydown event
      const event = new KeyboardEvent('keydown', { key: 'a', shiftKey: true });
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should handle Meta modifier', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        meta: true,
        action: mockAction,
        description: 'Meta+A shortcut',
      };

      shortcutManager.register(shortcut);
      
      // Simulate Meta+A keydown event
      const event = new KeyboardEvent('keydown', { key: 'a', metaKey: true });
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should not trigger when modifier keys do not match', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        ctrl: true,
        action: mockAction,
        description: 'Ctrl+A shortcut',
      };

      shortcutManager.register(shortcut);
      
      // Simulate A keydown event without Ctrl
      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      
      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe('case sensitivity', () => {
    it('should handle uppercase keys', () => {
      const shortcut: ShortcutConfig = {
        key: 'A',
        action: mockAction,
        description: 'Uppercase A shortcut',
      };

      shortcutManager.register(shortcut);
      
      // Simulate A keydown event
      const event = new KeyboardEvent('keydown', { key: 'A' });
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should handle lowercase keys', () => {
      const shortcut: ShortcutConfig = {
        key: 'a',
        action: mockAction,
        description: 'Lowercase a shortcut',
      };

      shortcutManager.register(shortcut);
      
      // Simulate a keydown event
      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      
      expect(mockAction).toHaveBeenCalled();
    });
  });
});