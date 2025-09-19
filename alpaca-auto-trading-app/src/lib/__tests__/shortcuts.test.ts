import { ShortcutManager, ShortcutConfig } from '../shortcuts';

// Mock keyboard event
const createKeyboardEvent = (key: string, ctrlKey = false, altKey = false, shiftKey = false) => {
  return new KeyboardEvent('keydown', {
    key,
    ctrlKey,
    altKey,
    shiftKey,
    bubbles: true,
  });
};

describe('ShortcutManager', () => {
  let shortcutManager: ShortcutManager;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    shortcutManager = new ShortcutManager();
    mockCallback = jest.fn();
    
    // Clear any existing shortcuts
    shortcutManager.clear();
  });

  afterEach(() => {
    shortcutManager.destroy();
  });

  describe('register', () => {
    it('should register a simple key shortcut', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      
      expect(shortcutManager.getShortcuts()).toHaveLength(1);
      expect(shortcutManager.getShortcuts()[0].key).toBe('k');
    });

    it('should register a modifier key shortcut', () => {
      const config: ShortcutConfig = {
        key: 'k',
        ctrlKey: true,
        callback: mockCallback,
        description: 'Ctrl+K shortcut',
      };

      shortcutManager.register(config);
      
      const shortcuts = shortcutManager.getShortcuts();
      expect(shortcuts).toHaveLength(1);
      expect(shortcuts[0].ctrlKey).toBe(true);
    });

    it('should register multiple shortcuts', () => {
      const configs: ShortcutConfig[] = [
        { key: 'k', callback: mockCallback, description: 'K shortcut' },
        { key: 'j', callback: mockCallback, description: 'J shortcut' },
        { key: 'l', callback: mockCallback, description: 'L shortcut' },
      ];

      configs.forEach(config => shortcutManager.register(config));
      
      expect(shortcutManager.getShortcuts()).toHaveLength(3);
    });

    it('should prevent duplicate shortcuts', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      shortcutManager.register(config);
      
      expect(shortcutManager.getShortcuts()).toHaveLength(1);
    });
  });

  describe('handleKeyDown', () => {
    it('should trigger callback for matching shortcut', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      
      const event = createKeyboardEvent('k');
      shortcutManager.handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(event);
    });

    it('should trigger callback for modifier key shortcut', () => {
      const config: ShortcutConfig = {
        key: 'k',
        ctrlKey: true,
        callback: mockCallback,
        description: 'Ctrl+K shortcut',
      };

      shortcutManager.register(config);
      
      const event = createKeyboardEvent('k', true);
      shortcutManager.handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callback for non-matching shortcut', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      
      const event = createKeyboardEvent('j');
      shortcutManager.handleKeyDown(event);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not trigger callback when modifier keys do not match', () => {
      const config: ShortcutConfig = {
        key: 'k',
        ctrlKey: true,
        callback: mockCallback,
        description: 'Ctrl+K shortcut',
      };

      shortcutManager.register(config);
      
      const event = createKeyboardEvent('k', false); // No Ctrl key
      shortcutManager.handleKeyDown(event);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive matching', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      
      const event = createKeyboardEvent('K'); // Uppercase
      shortcutManager.handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should prevent default behavior for matching shortcuts', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      
      const event = createKeyboardEvent('k');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      shortcutManager.handleKeyDown(event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('unregister', () => {
    it('should remove a registered shortcut', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      expect(shortcutManager.getShortcuts()).toHaveLength(1);
      
      shortcutManager.unregister('k');
      expect(shortcutManager.getShortcuts()).toHaveLength(0);
    });

    it('should handle unregistering non-existent shortcut', () => {
      expect(() => {
        shortcutManager.unregister('nonexistent');
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all shortcuts', () => {
      const configs: ShortcutConfig[] = [
        { key: 'k', callback: mockCallback, description: 'K shortcut' },
        { key: 'j', callback: mockCallback, description: 'J shortcut' },
      ];

      configs.forEach(config => shortcutManager.register(config));
      expect(shortcutManager.getShortcuts()).toHaveLength(2);
      
      shortcutManager.clear();
      expect(shortcutManager.getShortcuts()).toHaveLength(0);
    });
  });

  describe('getShortcuts', () => {
    it('should return all registered shortcuts', () => {
      const configs: ShortcutConfig[] = [
        { key: 'k', callback: mockCallback, description: 'K shortcut' },
        { key: 'j', callback: mockCallback, description: 'J shortcut' },
      ];

      configs.forEach(config => shortcutManager.register(config));
      
      const shortcuts = shortcutManager.getShortcuts();
      expect(shortcuts).toHaveLength(2);
      expect(shortcuts[0].key).toBe('k');
      expect(shortcuts[1].key).toBe('j');
    });
  });

  describe('getShortcutDescription', () => {
    it('should return description for existing shortcut', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      
      expect(shortcutManager.getShortcutDescription('k')).toBe('Test shortcut');
    });

    it('should return undefined for non-existent shortcut', () => {
      expect(shortcutManager.getShortcutDescription('nonexistent')).toBeUndefined();
    });
  });

  describe('isRegistered', () => {
    it('should return true for registered shortcut', () => {
      const config: ShortcutConfig = {
        key: 'k',
        callback: mockCallback,
        description: 'Test shortcut',
      };

      shortcutManager.register(config);
      
      expect(shortcutManager.isRegistered('k')).toBe(true);
    });

    it('should return false for non-registered shortcut', () => {
      expect(shortcutManager.isRegistered('nonexistent')).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should clean up event listeners', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      shortcutManager.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
