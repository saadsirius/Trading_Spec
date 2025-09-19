'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedTickerCardProps {
  item: {
    symbol: string;
    name?: string;
    type: string;
    price?: number;
    change1d?: number;
    change1w?: number;
    change1m?: number;
    volumeAvg?: number;
    marketCap?: number;
    pe?: number;
    dividendYield?: number;
    esg?: { score?: number; grade?: string };
    logoUrl?: string;
    sector?: string;
    score?: number;
    reason?: string;
    spark?: number[];
  };
  onAddWatch?: (symbol: string) => void;
  onCompare?: (symbol: string) => void;
  onAlert?: (symbol: string) => void;
  index?: number;
}

export default function AnimatedTickerCard({ 
  item, 
  onAddWatch, 
  onCompare, 
  onAlert, 
  index = 0 
}: AnimatedTickerCardProps) {
  const [price, setPrice] = useState(item.price);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/stream/prices?symbols=${item.symbol}`);
    es.onmessage = (ev) => {
      try {
        const j = JSON.parse(ev.data || '{}');
        if (j[item.symbol]) {
          setPrice(j[item.symbol]);
        }
      } catch {}
    };
    return () => es.close();
  }, [item.symbol]);

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  const fmtPct = (x?: number) => (x == null ? '—' : (x * 100).toFixed(1) + '%');

  return (
    <motion.div
      className="ds-card p-3 relative overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Hover background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        <div className="flex gap-3 items-center">
          <motion.img
            src={item.logoUrl || '/favicon.ico'}
            width={28}
            height={28}
            alt=""
            className="rounded"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          />
          
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link href={`/symbol/${item.symbol}`} className="font-semibold text-white hover:text-blue-400 transition-colors">
                  {item.symbol}
                </Link>
              </motion.div>
              
              <span className="text-xs text-gray-400">{item.name || item.type}</span>
              
              <motion.span
                className="badge"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {item.sector || '—'}
              </motion.span>
            </div>
            
            <div className="text-sm kpi mt-1">
              <motion.b
                key={price}
                initial={{ scale: 1.2, color: "#10b981" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ duration: 0.3 }}
              >
                {price?.toFixed?.(2) ?? '—'}
              </motion.b>
              
              <span className={`ml-2 ${((item.change1d || 0) >= 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmtPct(item.change1d)} / {fmtPct(item.change1w)} / {fmtPct(item.change1m)}
              </span>
            </div>
          </div>
          
          <div className="spark-mini">
            <motion.div
              className="w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded"
              animate={{ 
                background: isHovered 
                  ? "linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))"
                  : "linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))"
              }}
              transition={{ duration: 0.3 }}
            >
              <ai-sparkline data={(item.spark || []).join(',')}></ai-sparkline>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            Score ESG: <b>{item.esg?.grade || '—'}</b>{' '}
            {item.esg?.score != null ? `(${(item.esg!.score! * 100).toFixed(0)})` : ''}
          </div>
          <div>PER: <b>{item.pe ?? '—'}</b></div>
          <div>Div: <b>{item.dividendYield ? (item.dividendYield * 100).toFixed(1) + '%' : '—'}</b></div>
        </motion.div>

        <motion.div
          className="mt-2 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Score recherche: <b>{Math.round((item.score || 0) * 100)}</b> — {item.reason || '—'}
        </motion.div>

        <motion.div
          className="mt-3 flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { label: '+ Watchlist', action: () => onAddWatch?.(item.symbol), color: 'blue' },
            { label: 'Comparer', action: () => onCompare?.(item.symbol), color: 'green' },
            { label: 'Alerte IA', action: () => onAlert?.(item.symbol), color: 'purple' }
          ].map((button, btnIndex) => (
            <motion.button
              key={button.label}
              className={`badge bg-${button.color}-600/20 text-${button.color}-300 border-${button.color}-600/30 hover:bg-${button.color}-600/30 transition-colors`}
              onClick={() => handleAction(button.action)}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + btnIndex * 0.1 }}
            >
              {isLoading ? '...' : button.label}
            </motion.button>
          ))}
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link href={`/symbol/${item.symbol}`} className="badge bg-gray-600/20 text-gray-300 border-gray-600/30 hover:bg-gray-600/30 transition-colors">
              Graphique
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-gray-900/50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
