"use client";

import { useEffect } from "react";
import { combos, onKey } from "@/lib/shortcuts";
import { useUI } from "@/state/uiStore";
import { Toasts } from "@/lib/toast/ToastService";

export default function AnimatedNavbar() {
  const { isPaletteOpen, openPalette, closePalette } = useUI();

  useEffect(() => {
    // attach listeners on mount; detach on unmount
    const offPalette = onKey(combos.openPalette, () => {
      isPaletteOpen ? closePalette() : openPalette();
      Toasts.info('Command palette toggled', 'Shortcut');
    });
    const offHelp = onKey(combos.help, () => Toasts.info("Open Help / Shortcuts", "Keyboard Shortcut"));
    return () => { offPalette(); offHelp(); };
  }, [isPaletteOpen, openPalette, closePalette]);

  return (
    <nav className="glass px-4 py-2 flex items-center justify-between">
      <span className="font-semibold">Animated Navbar</span>
      <div className="text-xs text-white/60">Press {process.platform === "darwin" ? "⌘K" : "Ctrl+K"} for Commands</div>
    </nav>
  );
}
