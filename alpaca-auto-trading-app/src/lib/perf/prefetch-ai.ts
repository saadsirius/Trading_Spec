'use client';
const hoverStats = new Map<string, number>(); // href -> dwell(ms)

export function trackLink(el: HTMLAnchorElement) {
  let t = 0;
  const onEnter = () => { t = performance.now(); };
  const onLeave = () => { 
    const d = performance.now() - t; 
    hoverStats.set(el.href, (hoverStats.get(el.href) || 0) + d); 
    if (d > 120) {
      try { 
        (window as any).next?.router?.prefetch?.(new URL(el.href).pathname); 
      } catch {} 
    }
  };
  
  el.addEventListener('pointerenter', onEnter); 
  el.addEventListener('pointerleave', onLeave);
  
  return () => { 
    el.removeEventListener('pointerenter', onEnter); 
    el.removeEventListener('pointerleave', onLeave); 
  };
}
