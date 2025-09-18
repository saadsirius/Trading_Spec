'use client';
import { useState } from 'react';

export function WatchlistDnD({ 
  symbols: initial = ['SPY', 'QQQ', 'TLT', 'GLD'] 
}: { 
  symbols?: string[] 
}) {
  const [symbols, setSymbols] = useState(initial);
  
  const onDragStart = (i: number) => (e: React.DragEvent) => { 
    e.dataTransfer.setData('text/plain', String(i)); 
    e.currentTarget.classList.add('drag-ghost'); 
  };
  
  const onDragEnd = (e: React.DragEvent) => { 
    e.currentTarget.classList.remove('drag-ghost'); 
  };
  
  const onDrop = (i: number) => (e: React.DragEvent) => { 
    const from = Number(e.dataTransfer.getData('text/plain') || -1); 
    if (from < 0) return;
    const arr = [...symbols]; 
    const [m] = arr.splice(from, 1); 
    arr.splice(i, 0, m); 
    setSymbols(arr);
  };
  
  return (
    <ul className="ds-card" style={{ padding: 10 }}>
      {symbols.map((s, i) => (
        <li 
          key={s} 
          draggable 
          onDragStart={onDragStart(i)} 
          onDragEnd={onDragEnd} 
          onDragOver={e => e.preventDefault()} 
          onDrop={onDrop(i)}
          className="flex items-center justify-between py-1" 
          data-cursor="grab"
        >
          <span>{s}</span>
          <span className="text-xs text-gray-500">drag</span>
        </li>
      ))}
    </ul>
  );
}
