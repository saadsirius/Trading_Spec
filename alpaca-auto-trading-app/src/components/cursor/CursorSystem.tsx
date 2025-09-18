'use client';
import { useEffect, useRef, useState } from 'react';
import { emit } from '@/state/bus';

export default function CursorSystem() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string, x: number, y: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX, y = e.clientY;
      document.documentElement.style.setProperty('--cursor-x', x + 'px');
      document.documentElement.style.setProperty('--cursor-y', y + 'px');
      emit('cursor:move', { x, y, v: Math.hypot(e.movementX, e.movementY) });
    };
    const onEnterTip = (e: any) => { 
      setTip({ text: e.detail?.text || '', x: e.detail?.x || 0, y: e.detail?.y || 0 }); 
    };
    const onLeaveTip = () => setTip(null);
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('tooltip:show', onEnterTip as any);
    window.addEventListener('tooltip:hide', onLeaveTip as any);
    
    return () => { 
      window.removeEventListener('mousemove', onMove); 
      window.removeEventListener('tooltip:show', onEnterTip as any); 
      window.removeEventListener('tooltip:hide', onLeaveTip as any); 
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
      {tip && (
        <div 
          className="tooltip-follow" 
          style={{ left: tip.x + 14, top: tip.y + 18 }}
        >
          {tip.text}
        </div>
      )}
    </>
  );
}

// Utils pour déclencher un tooltip depuis n'importe quel composant :
export function showTooltip(text: string, x: number, y: number) { 
  window.dispatchEvent(new CustomEvent('tooltip:show', { detail: { text, x, y } })); 
}

export function hideTooltip() { 
  window.dispatchEvent(new CustomEvent('tooltip:hide')); 
}
