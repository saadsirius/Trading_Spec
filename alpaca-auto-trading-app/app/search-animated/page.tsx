'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AnimatedSearchBar from '@/components/search/AnimatedSearchBar';
import AnimatedTickerCard from '@/components/search/AnimatedTickerCard';

export default function AnimatedSearchPage() {
  const [items, setItems] = useState<any[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const handleResults = (results: any[]) => {
    setItems(results);
    setLoading(false);
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery) {
      setLoading(true);
    }
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setLoading(true);
  };

  const filteredItems = useMemo(() => {
    if (!filters) return items;

    return items.filter(item => {
      if (filters.type?.length > 0 && !filters.type.includes(item.type)) {
        return false;
      }
      if (filters.minPrice && item.price && item.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && item.price && item.price > filters.maxPrice) {
        return false;
      }
      if (filters.minVolume && item.volumeAvg && item.volumeAvg < filters.minVolume) {
        return false;
      }
      if (filters.minChange && item.change1d && item.change1d * 100 < filters.minChange) {
        return false;
      }
      if (filters.maxChange && item.change1d && item.change1d * 100 > filters.maxChange) {
        return false;
      }
      if (filters.esgGrade?.length > 0 && item.esg?.grade && !filters.esgGrade.includes(item.esg.grade)) {
        return false;
      }
      return true;
    });
  }, [items, filters]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-900 p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Recherche Avancée</h1>
            <p className="text-gray-400 mt-1">Découvrez et analysez les meilleures opportunités</p>
          </div>
          
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="badge bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showFilters ? 'Masquer filtres' : 'Filtres'}
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedSearchBar onResults={handleResults} onQueryChange={handleQueryChange} />
        </motion.div>

        {/* Results Summary */}
        <AnimatePresence>
          {query && (
            <motion.div
              className="ds-card p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Résultats pour "{query}"
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''} trouvé{filteredItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {loading && (
                  <motion.div
                    className="flex items-center gap-2 text-blue-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Recherche en cours...
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Bar */}
        <AnimatePresence>
          {compare.length > 0 && (
            <motion.div
              className="ds-card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Comparateur:</span>
                {compare.map((symbol, index) => (
                  <motion.span
                    key={symbol}
                    className="badge bg-green-600/20 text-green-300 border-green-600/30"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {symbol}
                  </motion.span>
                ))}
                <motion.button
                  className="badge bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600/30 transition-colors"
                  onClick={() => router.push(`/compare?symbols=${compare.join(',')}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ouvrir
                </motion.button>
                <motion.button
                  className="badge bg-red-600/20 text-red-300 border-red-600/30 hover:bg-red-600/30 transition-colors"
                  onClick={() => setCompare([])}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            {filteredItems.map((item: any, index: number) => (
              <motion.div
                key={item.symbol}
                variants={itemVariants}
                layout
              >
                <AnimatedTickerCard
                  item={item}
                  index={index}
                  onAddWatch={(s) => {
                    fetch('/api/watchlist/add', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ symbol: s })
                    });
                  }}
                  onCompare={(s) => setCompare(prev => Array.from(new Set([...prev, s])).slice(0, 6))}
                  onAlert={(s) => {
                    fetch('/api/alerts/create', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ symbol: s, rule: 'price_cross_donchian_20' })
                    });
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {!loading && filteredItems.length === 0 && query && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-500">Essayez avec d'autres termes de recherche</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
