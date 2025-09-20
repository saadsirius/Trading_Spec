/**
 * File: src/lib/shortcuts.ts
 * Description: Keyboard shortcuts management.
 */
export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
}

export class ShortcutManager {
  private shortcuts = new Map<string, ShortcutConfig>();
  private isEnabled = true;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.isEnabled) return;

    const key = e.key.toLowerCase();
    const shortcut = this.shortcuts.get(key);

    if (shortcut && this.matchesModifiers(e, shortcut)) {
      e.preventDefault();
      shortcut.action();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    // Handle key up events if needed
  }

  private matchesModifiers(e: KeyboardEvent, shortcut: ShortcutConfig): boolean {
    return (
      (shortcut.ctrl || false) === e.ctrlKey &&
      (shortcut.alt || false) === e.altKey &&
      (shortcut.shift || false) === e.shiftKey &&
      (shortcut.meta || false) === e.metaKey
    );
  }

  public register(shortcut: ShortcutConfig) {
    this.shortcuts.set(shortcut.key.toLowerCase(), shortcut);
  }

  public unregister(key: string) {
    this.shortcuts.delete(key.toLowerCase());
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }

  public getShortcuts(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values());
  }
}

// Global shortcut manager instance
export const shortcutManager = new ShortcutManager();