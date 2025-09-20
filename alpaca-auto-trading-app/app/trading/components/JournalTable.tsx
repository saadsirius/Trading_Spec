// FILE: components/journal/JournalTable.tsx
'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from 'lucide-react';

type Side = 'buy' | 'sell';
type Status = 'filled' | 'pending' | 'cancelled';
type OrderType = 'market' | 'limit';

export interface Trade {
  id: string;
  symbol: string;
  side: Side;
  quantity: number;
  price: number;
  timestamp: string; // ISO
  pnl?: number;
  pnlPercent?: number;
  status: Status;
  orderType: OrderType;
  notes?: string;
}

interface JournalTableProps {
  trades: Trade[];
  onEditTrade: (tradeId: string) => void;
  onDeleteTrade: (tradeId: string) => void;
  loading?: boolean;
}

const fmtMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

const clsx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

export const JournalTable = ({ trades, onEditTrade, onDeleteTrade, loading }: JournalTableProps) => {
  const [sortBy, setSortBy] = useState<keyof Trade>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [filterSide, setFilterSide] = useState<'all' | Side>('all');
  const [symbolQuery, setSymbolQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const handleSort = (col: keyof Trade) => {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const filtered = useMemo(() => {
    return trades
      .filter((t) => (filterStatus === 'all' ? true : t.status === filterStatus))
      .filter((t) => (filterSide === 'all' ? true : t.side === filterSide))
      .filter((t) =>
        symbolQuery.trim()
          ? t.symbol.toLowerCase().includes(symbolQuery.trim().toLowerCase())
          : true
      );
  }, [trades, filterStatus, filterSide, symbolQuery]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      // Date sorting
      if (sortBy === 'timestamp') {
        const ad = new Date(String(av)).getTime();
        const bd = new Date(String(bv)).getTime();
        return sortOrder === 'asc' ? ad - bd : bd - ad;
      }
      // Numeric columns (price, quantity, pnl, pnlPercent)
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortOrder === 'asc' ? av - bv : bv - av;
      }
      // Fallback string compare
      const as = String(av ?? '');
      const bs = String(bv ?? '');
      return sortOrder === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return copy;
  }, [filtered, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // KPIs
  const totalTrades = trades.length;
  const filledTrades = trades.filter((t) => t.status === 'filled');
  const totalPnL = filledTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const winRate = filledTrades.length
    ? (filledTrades.filter((t) => (t.pnl ?? 0) > 0).length / filledTrades.length) * 100
    : 0;

  // Export CSV
  const exportCSV = () => {
    const cols: (keyof Trade)[] = [
      'timestamp',
      'symbol',
      'side',
      'quantity',
      'price',
      'pnl',
      'pnlPercent',
      'status',
      'orderType',
      'notes',
    ];
    const header = cols.join(',');
    const rows = sorted.map((t) =>
      cols
        .map((c) => {
          const v = t[c];
          if (v === undefined || v === null) return '';
          if (typeof v === 'string') return `"${v.replace(/"/g, '""')}"`;
          return String(v);
        })
        .join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade_journal_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortIcon = (col: keyof Trade) => {
    if (sortBy !== col) return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <Card className="w-full p-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h3 className="text-lg font-semibold text-gray-900">Trade Journal</h3>
        <div className="flex items-center gap-2">
          <input
            value={symbolQuery}
            placeholder="Filter by symbol…"
            onChange={(e) => {
              setSymbolQuery(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <select
            value={filterSide}
            onChange={(e) => {
              setFilterSide(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="Filter side"
          >
            <option value="all">All Sides</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="Filter status"
          >
            <option value="all">All Status</option>
            <option value="filled">Filled</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Trades</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{totalTrades}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">{winRate.toFixed(1)}%</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Total P&L</span>
          </div>
          <div
            className={clsx(
              'text-2xl font-bold mt-1',
              totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {fmtMoney(totalPnL)}
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Filled Trades</span>
          </div>
          <div className="text-2xl font-bold text-orange-900 mt-1">{filledTrades.length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              {([
                ['timestamp', 'Date'],
                ['symbol', 'Symbol'],
                ['side', 'Side'],
                ['quantity', 'Quantity'],
                ['price', 'Price'],
                ['pnl', 'P&L'],
                ['status', 'Status'],
                ['orderType', 'Type'],
                ['notes', 'Notes'],
              ] as Array<[keyof Trade, string]>).map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={clsx(
                    'text-left py-3 px-4 font-medium text-gray-700 select-none',
                    'cursor-pointer hover:bg-gray-50'
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {label}
                    {sortIcon(key)}
                  </span>
                </th>
              ))}
              <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-gray-100">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10">
                    <div className="text-center text-gray-500">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-60" />
                      No trades match your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((trade, index) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: index * 0.02 }}
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                  >
                    <td className="py-3 px-4">
                      <div className="text-gray-900">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <span
                        className={clsx(
                          'px-2 py-1 text-xs rounded-full font-semibold',
                          trade.side === 'buy'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{trade.quantity}</td>
                    <td className="py-3 px-4 text-right">{fmtMoney(trade.price)}</td>
                    <td className="py-3 px-4">
                      {trade.pnl === undefined ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          {trade.pnl >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={clsx(
                              'font-semibold',
                              trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {fmtMoney(trade.pnl)}
                          </span>
                          {typeof trade.pnlPercent === 'number' && (
                            <span
                              className={clsx(
                                'text-xs',
                                trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              ({trade.pnlPercent.toFixed(2)}%)
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={clsx(
                          'px-2 py-1 text-xs rounded-full',
                          trade.status === 'filled'
                            ? 'bg-green-100 text-green-700'
                            : trade.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.orderType}</td>
                    <td className="py-3 px-4 max-w-[240px]">
                      <span className="block truncate text-gray-700" title={trade.notes}>
                        {trade.notes || <span className="text-gray-400">—</span>}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => onEditTrade(trade.id)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => onDeleteTrade(trade.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>

          {/* Footer summary row (only when data) */}
          {!loading && paged.length > 0 && (
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700" colSpan={4}>
                  Page Summary
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-700">
                  {/* Avg price on page */}
                  {fmtMoney(
                    paged.reduce((s, t) => s + t.price, 0) / (paged.length || 1)
                  )}
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  {fmtMoney(
                    paged.reduce((s, t) => s + (t.pnl ?? 0), 0)
                  )}
                </td>
                <td colSpan={5} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-gray-500">
          Showing <span className="font-semibold">{paged.length}</span> of{' '}
          <span className="font-semibold">{sorted.length}</span> filtered trades (
          {trades.length} total)
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(1);
            }}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
            aria-label="Rows per page"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </Button>
            <span className="px-2 text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};