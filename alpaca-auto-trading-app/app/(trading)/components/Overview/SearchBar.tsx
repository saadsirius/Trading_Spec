"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowUp, ArrowDown } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'symbol' | 'page' | 'action';
  title: string;
  subtitle?: string;
  href: string;
  icon?: string;
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: 'aapl',
      type: 'symbol',
      title: 'AAPL',
      subtitle: 'Apple Inc.',
      href: '/instruments/AAPL',
      icon: '🍎'
    },
    {
      id: 'tsla',
      type: 'symbol',
      title: 'TSLA',
      subtitle: 'Tesla Inc.',
      href: '/instruments/TSLA',
      icon: '🚗'
    },
    {
      id: 'trading',
      type: 'page',
      title: 'Trading Dashboard',
      subtitle: 'Main trading interface',
      href: '/trading',
      icon: '📊'
    },
    {
      id: 'portfolio',
      type: 'page',
      title: 'Portfolio',
      subtitle: 'View your holdings',
      href: '/portfolio',
      icon: '💼'
    },
    {
      id: 'buy-aapl',
      type: 'action',
      title: 'Buy AAPL',
      subtitle: 'Place buy order',
      href: '/trading?action=buy&symbol=AAPL',
      icon: '📈'
    }
  ];

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }

      // Escape to close
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Search results handler
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = mockResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.subtitle?.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // In a real app, this would navigate to the href
    console.log('Navigate to:', result.href);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'symbol':
        return 'text-support';
      case 'page':
        return 'text-secondary';
      case 'action':
        return 'text-accent';
      default:
        return 'text-white/60';
    }
  };

  return (
    <>
      {/* Search Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/60 hover:bg-white/15 hover:text-white/80 transition-all group"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">Search symbols, pages...</span>
        <div className="flex items-center space-x-1 text-xs">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-2xl mx-4 glass rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center space-x-3 p-4 border-b border-white/10">
                <Search className="w-5 h-5 text-white/60" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search symbols, pages, actions..."
                  className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                />
                <div className="flex items-center space-x-1 text-xs text-white/40">
                  <ArrowUp className="w-3 h-3" />
                  <ArrowDown className="w-3 h-3" />
                  <span>to navigate</span>
                  <span className="ml-2">↵</span>
                  <span>to select</span>
                </div>
              </div>

              {/* Search Results */}
              <div ref={resultsRef} className="max-h-96 overflow-y-auto">
                {query && results.length === 0 ? (
                  <div className="p-8 text-center text-white/60">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No results found for "{query}"</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-white/10 transition-colors ${
                          index === selectedIndex ? 'bg-white/10' : ''
                        }`}
                      >
                        <div className="text-lg">{result.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {result.title}
                          </div>
                          <div className="text-sm text-white/60 truncate">
                            {result.subtitle}
                          </div>
                        </div>
                        <div className={`text-xs font-medium ${getTypeColor(result.type)}`}>
                          {result.type}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-white/60">
                    <Command className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Type to search symbols, pages, and actions</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
