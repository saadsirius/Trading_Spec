import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { motion } from 'framer-motion';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; item: T }) => React.ReactNode;
  className?: string;
  overscanCount?: number;
}

// Memoized item renderer
const ItemRenderer = memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: { items: any[]; renderItem: any } 
}) => {
  const { items, renderItem } = data;
  const item = items[index];
  
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.01 }}
    >
      {renderItem({ index, style, item })}
    </motion.div>
  );
});

ItemRenderer.displayName = 'ItemRenderer';

// Main virtualized list component
const VirtualizedList = memo(<T,>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscanCount = 5,
}: VirtualizedListProps<T>) => {
  // Memoized item data
  const itemData = useMemo(() => ({
    items,
    renderItem,
  }), [items, renderItem]);

  return (
    <div className={`virtualized-list ${className}`}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={overscanCount}
        className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {ItemRenderer}
      </List>
    </div>
  );
}) as <T>(props: VirtualizedListProps<T>) => React.ReactElement;

VirtualizedList.displayName = 'VirtualizedList';

// Hook for virtualized list with dynamic sizing
export const useVirtualizedList = <T,>(
  items: T[],
  containerHeight: number,
  estimatedItemHeight: number = 50
) => {
  const itemCount = items.length;
  const totalHeight = itemCount * estimatedItemHeight;
  const isVirtualized = totalHeight > containerHeight;

  return {
    isVirtualized,
    itemCount,
    totalHeight,
    estimatedItemHeight,
  };
};

// Specialized virtualized components
export const VirtualizedSearchResults = memo(({ 
  results, 
  height = 400 
}: { 
  results: any[]; 
  height?: number; 
}) => {
  const renderItem = ({ index, style, item }: { index: number; style: React.CSSProperties; item: any }) => (
    <div style={style} className="px-4 py-2 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-white">{item.symbol}</div>
          <div className="text-sm text-gray-400">{item.name}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-white">${item.price?.toFixed(2) || 'N/A'}</div>
          <div className={`text-sm ${item.change1d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {item.change1d ? `${(item.change1d * 100).toFixed(2)}%` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VirtualizedList
      items={results}
      height={height}
      itemHeight={80}
      renderItem={renderItem}
      className="border border-gray-700 rounded-lg"
    />
  );
});

VirtualizedSearchResults.displayName = 'VirtualizedSearchResults';

export const VirtualizedWatchlist = memo(({ 
  watchlist, 
  height = 300 
}: { 
  watchlist: any[]; 
  height?: number; 
}) => {
  const renderItem = ({ index, style, item }: { index: number; style: React.CSSProperties; item: any }) => (
    <div style={style} className="px-4 py-3 border-b border-gray-700 hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={item.logoUrl || '/favicon.ico'} 
            alt={item.symbol} 
            width={24} 
            height={24} 
            className="rounded"
            loading="lazy"
          />
          <div>
            <div className="font-semibold text-white">{item.symbol}</div>
            <div className="text-sm text-gray-400">{item.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-white">${item.price?.toFixed(2) || 'N/A'}</div>
          <div className={`text-sm ${item.change1d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {item.change1d ? `${(item.change1d * 100).toFixed(2)}%` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VirtualizedList
      items={watchlist}
      height={height}
      itemHeight={70}
      renderItem={renderItem}
      className="border border-gray-700 rounded-lg"
    />
  );
});

VirtualizedWatchlist.displayName = 'VirtualizedWatchlist';

export default VirtualizedList;
