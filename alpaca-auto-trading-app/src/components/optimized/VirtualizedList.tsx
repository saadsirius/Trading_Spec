/**
 * File: src/components/optimized/VirtualizedList.tsx
 * Description: Virtualized list component for performance.
 */
'use client';

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; item: T }) => React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  overscanCount?: number;
}

export default function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  onScroll,
  overscanCount = 5,
}: VirtualizedListProps<T>) {
  const listRef = useRef<List>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    setIsScrolling(true);
    onScroll?.(scrollTop);
    
    // Reset scrolling state after a delay
    setTimeout(() => setIsScrolling(false), 150);
  }, [onScroll]);

  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div style={style}>
        {renderItem({ index, style, item })}
      </div>
    );
  }, [items, renderItem]);

  const memoizedItems = useMemo(() => items, [items]);

  return (
    <div className={`virtualized-list ${className}`}>
      <List
        ref={listRef}
        height={height}
        itemCount={memoizedItems.length}
        itemSize={itemHeight}
        onScroll={handleScroll}
        overscanCount={overscanCount}
        className={isScrolling ? 'scrolling' : ''}
      >
        {ItemRenderer}
      </List>
    </div>
  );
}

// Add displayName for debugging
VirtualizedList.displayName = 'VirtualizedList';