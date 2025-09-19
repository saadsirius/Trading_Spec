/**
 * File: src/components/dnd/WatchlistDnD.tsx
 * Description: Drag and drop watchlist component with haptic feedback.
 */
'use client';

import { useState, useCallback } from 'react';

interface WatchlistDnDProps {
  symbols: string[];
  onReorder?: (newOrder: string[]) => void;
}

export function WatchlistDnD({ symbols, onReorder }: WatchlistDnDProps) {
  const [items, setItems] = useState(symbols);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    // Haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Haptic feedback for successful drop
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    onReorder?.(newItems);
  }, [draggedIndex, items, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div className="space-y-2">
      {items.map((symbol, index) => (
        <div
          key={symbol}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            p-3 rounded-lg border-2 border-dashed cursor-move transition-all duration-200
            ${draggedIndex === index 
              ? 'opacity-50 scale-95' 
              : dragOverIndex === index 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }
          `}
          role="button"
          tabIndex={0}
          aria-label={`Drag ${symbol} to reorder`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{symbol}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">#{index + 1}</span>
              <div className="w-2 h-2 bg-gray-500 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}