"use client";
import { useEffect } from "react";

export function useCommandPalette(open: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") { 
        e.preventDefault(); 
        open(); 
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
}
