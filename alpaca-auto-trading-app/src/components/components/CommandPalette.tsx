"use client";

import { useEffect } from "react";
import { useUI } from "@/state/uiStore";
import { combos, onKey } from "@/lib/shortcuts";
import { Toasts } from "@/lib/toast/ToastService";

export default function CommandPalette() {
  const { isPaletteOpen, openPalette, closePalette } = useUI();

  useEffect(() => {
    return onKey(combos.openPalette, () => {
      isPaletteOpen ? closePalette() : openPalette();
      Toasts.info('Command palette toggled', 'Shortcut');
    });
  }, [isPaletteOpen, openPalette, closePalette]);

  if (!isPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={closePalette}>
      <div
        className="glass max-w-xl mx-auto mt-24 p-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <input
          autoFocus
          placeholder="Type a command…"
          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20"
        />
        <div className="text-xs text-white/60 mt-2">Press Esc to close</div>
      </div>
    </div>
  );
}
