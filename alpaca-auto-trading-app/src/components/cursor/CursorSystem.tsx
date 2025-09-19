/**
 * File: src/components/cursor/CursorSystem.tsx
 * Description: Cursor system with tooltip management and visual effects.
 */
'use client';

import { useEffect, useRef } from 'react';

// Global tooltip state
let tooltipElement: HTMLDivElement | null = null;

export function showTooltip(text: string, x: number, y: number) {
  if (!tooltipElement) {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'fixed z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg pointer-events-none transition-opacity duration-150';
    tooltipElement.style.opacity = '0';
    document.body.appendChild(tooltipElement);
  }

  tooltipElement.textContent = text;
  tooltipElement.style.left = `${x + 10}px`;
  tooltipElement.style.top = `${y - 30}px`;
  tooltipElement.style.opacity = '1';
}

export function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.style.opacity = '0';
  }
}

export default function CursorSystem() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    document.addEventListener('mousemove', handleMouseMove);
    updateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed w-6 h-6 border-2 border-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      
      {/* Cursor trail effect */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <div className="absolute w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
      </div>
    </>
  );
}