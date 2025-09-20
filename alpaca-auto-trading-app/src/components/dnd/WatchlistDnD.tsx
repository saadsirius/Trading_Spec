/**
 * File: src/components/dnd/WatchlistDnD.tsx
 * Description: Drag and Drop watchlist component with haptic feedback.
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WatchlistDnDProps {
  symbols: string[];
  onReorder?: (newOrder: string[]) => void;
  onRemove?: (symbol: string) => void;
  onAdd?: (symbol: string) => void;
}

interface DragState {
  draggedIndex: number | null;
  draggedOverIndex: number | null;
  isDragging: boolean;
}

export function WatchlistDnD({ 
  symbols, 
  onReorder, 
  onRemove, 
  onAdd 
}: WatchlistDnDProps) {
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOverIndex: null,
    isDragging: false,
  });
  
  const [localSymbols, setLocalSymbols] = useState(symbols);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragState({
      draggedIndex: index,
      draggedOverIndex: null,
      isDragging: true,
    });

    // Haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Set drag data
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      draggedOverIndex: index,
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the container entirely
    if (!dragRef.current?.contains(e.relatedTarget as Node)) {
      setDragState(prev => ({
        ...prev,
        draggedOverIndex: null,
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) {
      setDragState({
        draggedIndex: null,
        draggedOverIndex: null,
        isDragging: false,
      });
      return;
    }

    // Reorder symbols
    const newSymbols = [...localSymbols];
    const [draggedSymbol] = newSymbols.splice(dragIndex, 1);
    newSymbols.splice(dropIndex, 0, draggedSymbol);

    setLocalSymbols(newSymbols);
    onReorder?.(newSymbols);

    // Haptic feedback for successful drop
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    setDragState({
      draggedIndex: null,
      draggedOverIndex: null,
      isDragging: false,
    });
  }, [localSymbols, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedIndex: null,
      draggedOverIndex: null,
      isDragging: false,
    });
  }, []);

  const removeSymbol = useCallback((symbol: string) => {
    const newSymbols = localSymbols.filter(s => s !== symbol);
    setLocalSymbols(newSymbols);
    onRemove?.(symbol);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [localSymbols, onRemove]);

  const addSymbol = useCallback((symbol: string) => {
    if (!localSymbols.includes(symbol)) {
      const newSymbols = [...localSymbols, symbol];
      setLocalSymbols(newSymbols);
      onAdd?.(symbol);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }, [localSymbols, onAdd]);

  return (
    <div 
      ref={dragRef}
      className="space-y-2 min-h-[200px] p-4 border-2 border-dashed border-gray-600 rounded-lg"
    >
      <div className="text-sm text-gray-400 mb-3">
        Drag to reorder • Click to remove
      </div>
      
      <AnimatePresence>
        {localSymbols.map((symbol, index) => (
          <motion.div
            key={symbol}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center justify-between p-3 rounded-lg cursor-move
              transition-all duration-200
              ${dragState.draggedIndex === index 
                ? 'bg-blue-600/30 border-2 border-blue-400 shadow-lg scale-105' 
                : dragState.draggedOverIndex === index
                ? 'bg-green-600/20 border-2 border-green-400'
                : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center text-xs">
                ⋮⋮
              </div>
              <span className="font-mono text-white">{symbol}</span>
            </div>
            
            <button
              onClick={() => removeSymbol(symbol)}
              className="text-red-400 hover:text-red-300 transition-colors"
              aria-label={`Remove ${symbol}`}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {localSymbols.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-8"
        >
          No symbols in watchlist
        </motion.div>
      )}

      {/* Add symbol input */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add symbol (e.g., AAPL)"
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const symbol = input.value.trim().toUpperCase();
                if (symbol) {
                  addSymbol(symbol);
                  input.value = '';
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder*="Add symbol"]') as HTMLInputElement;
              const symbol = input?.value.trim().toUpperCase();
              if (symbol) {
                addSymbol(symbol);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}