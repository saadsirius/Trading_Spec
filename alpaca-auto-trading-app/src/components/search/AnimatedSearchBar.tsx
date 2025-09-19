'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedSearchBarProps {
  onResults: (items: any[]) => void;
  onQueryChange?: (query: string) => void;
}

export default function AnimatedSearchBar({ onResults, onQueryChange }: AnimatedSearchBarProps) {
  const [q, setQ] = useState('');
  const [suggest, setSuggest] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!q) {
      setSuggest([]);
      onResults([]);
      onQueryChange?.('');
      return;
    }

    onQueryChange?.(q);
    setIsLoading(true);

    const id = setTimeout(async () => {
      try {
        const [suggestRes, searchRes] = await Promise.all([
          fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`).then(r => r.json()),
          fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json())
        ]);
        
        setSuggest(suggestRes.items || []);
        onResults(searchRes.items || []);
      } catch (error) {
        console.error('Search error:', error);
        setSuggest([]);
        onResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(id);
  }, [q, onResults, onQueryChange]);

  const handleSuggestionClick = (suggestion: any) => {
    setQ(suggestion.symbol);
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <motion.div
        className="ds-card p-2 relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="flex-1 relative"
            animate={{ scale: isFocused ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <input
              ref={inputRef}
              autoFocus
              placeholder="Rechercher (AAPL, BTC, 'NVIDIA'…)"
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="w-full bg-transparent outline-none px-2 py-2 text-white placeholder-gray-400"
            />
            
            {/* Loading indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <motion.div
                    className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {suggest.length > 0 && isFocused && (
            <motion.div
              className="mt-2 grid grid-cols-2 gap-1"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {suggest.map((s: any, index) => (
                <motion.button
                  key={s.symbol}
                  className="badge text-left"
                  onClick={() => handleSuggestionClick(s)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-semibold">{s.symbol}</span>
                  <span className="text-gray-400 ml-1">· {s.name || s.type}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search results count indicator */}
      <AnimatePresence>
        {q && (
          <motion.div
            className="absolute -bottom-8 left-0 text-xs text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            Recherche: "{q}"
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
