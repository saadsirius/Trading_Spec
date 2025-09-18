#!/bin/bash
# ===== One-shot bootstrap: Portfolio + Historique + Infra (Next.js / TypeScript) =====
# Prérequis: Next.js (app/), Node 18+, pnpm|yarn|npm
# Exécute: bash setup-trading-suite.sh  (ou colle tel quel dans ton terminal)

set -euo pipefail

echo "🚀 Bootstrap Trading Suite - Warrior Platform"

# --- Dossiers ---
echo "📁 Création de l'arborescence..."
mkdir -p app/portfolio app/history app/api/history components lib/trading lib/api lib/validation lib/errors store tests
mkdir -p public && mkdir -p app/api/portfolio

# --- .cursorrules (instructions pour Cursor – pur texte) ---
echo "📝 Mise à jour des instructions Cursor..."
cat > .cursorrules <<'EOF'
# Projet: Alpaca Auto Trading App — Instruction Set pour Cursor
# Objectif: Reproduire les fonctionnalités essentielles de Trading212/TradingView pour usage personnel,
# avec backtesting ultérieur, screener, charts type TradingView, sentiment analysis, calendrier, "pentagone" (radar) par indice,
# et un workflow robuste: typage strict, erreurs gérées, tests, traçabilité, accessibilité.

## Périmètre immédiat (MUST)
- Pages prêtes à l'emploi: /portfolio et /history.
- Charts: utiliser `lightweight-charts` (TradingView-like). Aucune magie opaque: code lisible, thèmes clair/sombre, synchronisation crosshair/tooltip.
- DataTable: `@tanstack/react-table` pour de grosses listes (positions, transactions) avec pagination, tri, filtres, export CSV.
- État: `zustand` pour un state global léger (positions, watchlist, filtres).
- Erreurs:
  - Validation d'entrées: `zod`
  - Couche fetch typée avec interception d'erreurs et retrying exponentiel (limité).
  - `ErrorBoundary` + toasts non-bloquants.
- Accessibilité: composants actionnables au clavier, aria-* sur toasts/table/onglets, `data-testid` stables pour les tests.
- Observabilité: points de trace (console.warn/info), compteur d'actions utilisateur minimal.
- Tests: Vitest + React Testing Library (au moins 2 tests smoke: Portfolio et Historique).
- IA & Sentiment: fournir des stubs clairs (fonctions/clients), pas de promesses vides; interfaces bien typées pour brancher des providers (news, LLM, events) plus tard.
- Calendrier marché/événements: stub typé (prochaines annonces, dividendes, earnings).

## Non-ambiguïtés — CHARTS & ALARMES IA
- Charts:
  - `lightweight-charts` uniquement pour les prix; une ligne P&L sur Y2 optionnelle via série de type baseline.
  - Timezone: UTC interne, affichage local côté client (Intl).
  - Formats: prix (2-4 décimales selon symbole), pourcentages avec signe, unités cohérentes.
  - Pas d'effets flous; grid, crosshair, scale/scroll activés, style minimal élégant.
- Alertes IA:
  - Jamais d'alerte "magique": expliquer la règle (ex: "RSI < 30 ET volume > 20j MA").
  - Toujours inclure:
    - règle lisible
    - score de confiance [0..1]
    - fenêtre d'observation (ex: 15m / 1h / 1d)
    - lien "voir la preuve" (renvoie vers la section du chart/transactions concernée)
  - Les messages IA sont des suggestions, pas des ordres.

## Bonnes pratiques de code
- TypeScript strict, no any implicite.
- Zod pour tout payload entrant/sortant (API et UI).
- Composants petits, testables, documentés en-tête.
- Aucune logique réseau dans les composants UI.
- Préférer composition à héritage; hooks spécialisés pour effets et stores.

## Ce que Cursor doit faire par défaut
- Respecter les types et schémas fournis.
- Générer du code minimal, clair et commenté.
- Suggérer des tests quand un composant dépasse 50 lignes.
- Quand "historique / portfolio" est mentionné, utiliser les composants existants,
  ne jamais réinventer: ChartWrapper, DataTable, ErrorBoundary, StatusPill, NewsTicker, AIInsights.

# Fin .cursorrules
EOF

# --- lib/errors.ts ---
echo "🔧 Création de la gestion d'erreurs..."
cat > lib/errors.ts <<'EOF'
/**
 * Gestion d'erreurs centralisée: typage + helpers d'affichage.
 */
export class AppError extends Error {
  code?: string; status?: number; meta?: Record<string, unknown>;
  constructor(message: string, opts: { code?: string; status?: number; meta?: Record<string, unknown> } = {}) {
    super(message); Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'AppError'; this.code = opts.code; this.status = opts.status; this.meta = opts.meta;
  }
}
export const isAppError = (e: unknown): e is AppError => e instanceof AppError;

export function toAppError(e: unknown, fallback = 'Une erreur est survenue'): AppError {
  if (isAppError(e)) return e;
  if (e instanceof Error) return new AppError(e.message);
  return new AppError(fallback);
}
EOF

# --- lib/validation.ts (Zod schémas) ---
echo "📋 Création des schémas de validation..."
cat > lib/validation.ts <<'EOF'
import { z } from "zod";

export const PositionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  qty: z.number(),
  avgPrice: z.number(),
  marketPrice: z.number(),
  pnl: z.number(),
  pnlPct: z.number(),
  sector: z.string().optional(),
  updatedAt: z.string(), // ISO
});

export const OrderSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: z.enum(["buy","sell"]),
  type: z.enum(["market","limit","stop","stop_limit"]).optional(),
  qty: z.number(),
  price: z.number().optional(),
  status: z.enum(["new","filled","partially_filled","canceled","rejected"]),
  createdAt: z.string(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: z.enum(["buy","sell","dividend","fee","interest"]),
  qty: z.number().optional(),
  price: z.number().optional(),
  amount: z.number().optional(),
  ts: z.string(), // ISO
  ref: z.string().optional(), // lien traçable (orderId, transferId)
});

export const PortfolioSummarySchema = z.object({
  equity: z.number(),
  cash: z.number(),
  dayPnl: z.number(),
  dayPnlPct: z.number(),
  allTimePnl: z.number(),
});

export const WatchItemSchema = z.object({
  symbol: z.string(),
  name: z.string().optional(),
  note: z.string().optional(),
  sentiment: z.number().min(-1).max(1).optional(),
  lastPrice: z.number().optional(),
  changePct: z.number().optional(),
});

export const HistoryFilterSchema = z.object({
  symbol: z.string().optional(),
  side: z.enum(["buy","sell","dividend","fee","interest"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
}).strict();

export type Position = z.infer<typeof PositionSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type WatchItem = z.infer<typeof WatchItemSchema>;
export type HistoryFilter = z.infer<typeof HistoryFilterSchema>;
EOF

# --- lib/api/client.ts (fetch typé + retry + gestion d'erreurs) ---
echo "🌐 Création du client API..."
cat > lib/api/client.ts <<'EOF'
import { AppError, toAppError } from "@/lib/errors";

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new AppError(
        `HTTP ${response.status}: ${response.statusText}`,
        { status: response.status, code: 'HTTP_ERROR' }
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('Request timeout', { code: 'TIMEOUT' });
    }

    if (retries > 0 && !(error instanceof AppError)) {
      await sleep(1000 * (3 - retries)); // exponential backoff
      return apiCall<T>(url, options, retries - 1);
    }

    throw toAppError(error);
  }
}

export const api = {
  get: <T>(url: string) => apiCall<T>(url, { method: 'GET' }),
  post: <T>(url: string, data?: unknown) => 
    apiCall<T>(url, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  put: <T>(url: string, data?: unknown) => 
    apiCall<T>(url, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  delete: <T>(url: string) => apiCall<T>(url, { method: 'DELETE' }),
};
EOF

# --- store/portfolio.ts (Zustand store) ---
echo "🏪 Création du store Portfolio..."
cat > store/portfolio.ts <<'EOF'
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Position, PortfolioSummary, WatchItem } from '@/lib/validation';

interface PortfolioState {
  // Portfolio data
  positions: Position[];
  summary: PortfolioSummary | null;
  watchlist: WatchItem[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPositions: (positions: Position[]) => void;
  setSummary: (summary: PortfolioSummary) => void;
  addToWatchlist: (item: WatchItem) => void;
  removeFromWatchlist: (symbol: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getPosition: (symbol: string) => Position | undefined;
  getWatchItem: (symbol: string) => WatchItem | undefined;
}

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    (set, get) => ({
      positions: [],
      summary: null,
      watchlist: [],
      isLoading: false,
      error: null,

      setPositions: (positions) => set({ positions }),
      setSummary: (summary) => set({ summary }),
      
      addToWatchlist: (item) => set((state) => ({
        watchlist: [...state.watchlist.filter(w => w.symbol !== item.symbol), item]
      })),
      
      removeFromWatchlist: (symbol) => set((state) => ({
        watchlist: state.watchlist.filter(w => w.symbol !== symbol)
      })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getPosition: (symbol) => get().positions.find(p => p.symbol === symbol),
      getWatchItem: (symbol) => get().watchlist.find(w => w.symbol === symbol),
    }),
    { name: 'portfolio-store' }
  )
);
EOF

# --- components/ChartWrapper.tsx ---
echo "📊 Création du composant Chart..."
cat > components/ChartWrapper.tsx <<'EOF'
"use client";
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartData {
  time: string;
  value: number;
}

interface ChartWrapperProps {
  data: ChartData[];
  symbol: string;
  height?: number;
  className?: string;
}

export function ChartWrapper({ data, symbol, height = 300, className = '' }: ChartWrapperProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1a1a1a' : '#ffffff' },
        textColor: isDark ? '#ffffff' : '#333333',
      },
      grid: {
        vertLines: { color: isDark ? '#333333' : '#e1e1e1' },
        horzLines: { color: isDark ? '#333333' : '#e1e1e1' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: isDark ? '#333333' : '#e1e1e1',
      },
      timeScale: {
        borderColor: isDark ? '#333333' : '#e1e1e1',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height,
    });

    // Create series
    const series = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    });

    // Set data
    series.setData(data);

    // Store refs
    chartRef.current = chart;
    seriesRef.current = series;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data, height, isDark]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{symbol}</h3>
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
          data-testid="chart-theme-toggle"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
      <div ref={chartContainerRef} className="w-full" data-testid="chart-container" />
    </div>
  );
}
EOF

# --- components/DataTable.tsx ---
echo "📋 Création du composant DataTable..."
cat > components/DataTable.tsx <<'EOF'
"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';

interface DataTableProps<T> {
  data: T[];
  columns: any[];
  searchable?: boolean;
  exportable?: boolean;
  className?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  searchable = true, 
  exportable = true,
  className = '' 
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const exportToCSV = () => {
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...data.map(row => 
        columns.map(col => {
          const value = col.accessorKey ? (row as any)[col.accessorKey] : '';
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex justify-between items-center">
        {searchable && (
          <input
            type="text"
            placeholder="Rechercher..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
            data-testid="table-search"
          />
        )}
        {exportable && (
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            data-testid="export-csv"
          >
            📊 Export CSV
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="border border-gray-300 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                    data-testid={`header-${header.id}`}
                  >
                    <div className="flex items-center space-x-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && '↑'}
                      {header.column.getIsSorted() === 'desc' && '↓'}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="border border-gray-300 px-4 py-2"
                    data-testid={`cell-${cell.column.id}-${row.id}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      <div className="text-sm text-gray-600">
        {table.getFilteredRowModel().rows.length} lignes affichées
      </div>
    </div>
  );
}
EOF

# --- app/portfolio/page.tsx ---
echo "💼 Création de la page Portfolio..."
cat > app/portfolio/page.tsx <<'EOF'
"use client";
import { useEffect } from 'react';
import { usePortfolioStore } from '@/store/portfolio';
import { DataTable } from '@/components/DataTable';
import { ChartWrapper } from '@/components/ChartWrapper';
import { createColumnHelper } from '@tanstack/react-table';
import type { Position } from '@/lib/validation';

const columnHelper = createColumnHelper<Position>();

const columns = [
  columnHelper.accessor('symbol', {
    header: 'Symbole',
    cell: info => (
      <span className="font-mono font-semibold">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('qty', {
    header: 'Quantité',
    cell: info => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('avgPrice', {
    header: 'Prix Moyen',
    cell: info => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('marketPrice', {
    header: 'Prix Marché',
    cell: info => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('pnl', {
    header: 'P&L',
    cell: info => {
      const value = info.getValue();
      const isPositive = value >= 0;
      return (
        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${value.toFixed(2)}
        </span>
      );
    },
  }),
  columnHelper.accessor('pnlPct', {
    header: 'P&L %',
    cell: info => {
      const value = info.getValue();
      const isPositive = value >= 0;
      return (
        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </span>
      );
    },
  }),
];

export default function PortfolioPage() {
  const { 
    positions, 
    summary, 
    isLoading, 
    error, 
    setPositions, 
    setSummary, 
    setLoading, 
    setError 
  } = usePortfolioStore();

  // Mock data for demo
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockPositions: Position[] = [
        {
          id: '1',
          symbol: 'AAPL',
          qty: 100,
          avgPrice: 150.00,
          marketPrice: 175.50,
          pnl: 2550.00,
          pnlPct: 17.00,
          sector: 'Technology',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          symbol: 'TSLA',
          qty: 50,
          avgPrice: 200.00,
          marketPrice: 180.25,
          pnl: -987.50,
          pnlPct: -9.88,
          sector: 'Automotive',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          symbol: 'MSFT',
          qty: 75,
          avgPrice: 300.00,
          marketPrice: 325.80,
          pnl: 1935.00,
          pnlPct: 8.60,
          sector: 'Technology',
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockSummary = {
        equity: 125000.00,
        cash: 15000.00,
        dayPnl: 1250.00,
        dayPnlPct: 1.01,
        allTimePnl: 3497.50,
      };

      setPositions(mockPositions);
      setSummary(mockSummary);
      setLoading(false);
    }, 1000);
  }, [setPositions, setSummary, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Erreur</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Mock chart data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    time: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: 120000 + Math.sin(i * 0.2) * 5000 + Math.random() * 2000,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
          <p className="text-gray-600">Vue d'ensemble de vos positions et performance</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Équité Totale</h3>
              <p className="text-2xl font-bold text-gray-900">${summary.equity.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cash</h3>
              <p className="text-2xl font-bold text-gray-900">${summary.cash.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">P&L Jour</h3>
              <p className={`text-2xl font-bold ${summary.dayPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.dayPnl >= 0 ? '+' : ''}${summary.dayPnl.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">P&L Total</h3>
              <p className={`text-2xl font-bold ${summary.allTimePnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.allTimePnl >= 0 ? '+' : ''}${summary.allTimePnl.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <ChartWrapper data={chartData} symbol="Portfolio Equity" height={400} />
        </div>

        {/* Positions Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Positions</h2>
          <DataTable data={positions} columns={columns} />
        </div>
      </div>
    </div>
  );
}
EOF

# --- app/history/page.tsx ---
echo "📜 Création de la page Historique..."
cat > app/history/page.tsx <<'EOF'
"use client";
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import type { Transaction, HistoryFilter } from '@/lib/validation';

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor('ts', {
    header: 'Date',
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('symbol', {
    header: 'Symbole',
    cell: info => (
      <span className="font-mono font-semibold">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('side', {
    header: 'Type',
    cell: info => {
      const side = info.getValue();
      const colors = {
        buy: 'text-green-600 bg-green-100',
        sell: 'text-red-600 bg-red-100',
        dividend: 'text-blue-600 bg-blue-100',
        fee: 'text-gray-600 bg-gray-100',
        interest: 'text-purple-600 bg-purple-100',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[side]}`}>
          {side.toUpperCase()}
        </span>
      );
    },
  }),
  columnHelper.accessor('qty', {
    header: 'Quantité',
    cell: info => {
      const qty = info.getValue();
      return qty ? qty.toLocaleString() : '-';
    },
  }),
  columnHelper.accessor('price', {
    header: 'Prix',
    cell: info => {
      const price = info.getValue();
      return price ? `$${price.toFixed(2)}` : '-';
    },
  }),
  columnHelper.accessor('amount', {
    header: 'Montant',
    cell: info => {
      const amount = info.getValue();
      if (!amount) return '-';
      const isPositive = amount >= 0;
      return (
        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${amount.toFixed(2)}
        </span>
      );
    },
  }),
];

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<HistoryFilter>({});

  // Mock data for demo
  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          symbol: 'AAPL',
          side: 'buy',
          qty: 100,
          price: 150.00,
          amount: -15000.00,
          ts: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'order_123',
        },
        {
          id: '2',
          symbol: 'TSLA',
          side: 'buy',
          qty: 50,
          price: 200.00,
          amount: -10000.00,
          ts: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'order_124',
        },
        {
          id: '3',
          symbol: 'AAPL',
          side: 'dividend',
          amount: 75.00,
          ts: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'div_001',
        },
        {
          id: '4',
          symbol: 'MSFT',
          side: 'buy',
          qty: 75,
          price: 300.00,
          amount: -22500.00,
          ts: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'order_125',
        },
        {
          id: '5',
          symbol: 'TSLA',
          side: 'fee',
          amount: -1.00,
          ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'fee_001',
        },
      ];

      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Transactions</h1>
          <p className="text-gray-600">Toutes vos transactions et mouvements de compte</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symbole</label>
              <input
                type="text"
                placeholder="AAPL, TSLA..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.symbol || ''}
                onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.side || ''}
                onChange={(e) => setFilters({ ...filters, side: e.target.value as any })}
              >
                <option value="">Tous</option>
                <option value="buy">Achat</option>
                <option value="sell">Vente</option>
                <option value="dividend">Dividende</option>
                <option value="fee">Frais</option>
                <option value="interest">Intérêt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.from || ''}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transactions</h2>
          <DataTable data={transactions} columns={columns} />
        </div>
      </div>
    </div>
  );
}
EOF

# --- tests/portfolio.test.tsx ---
echo "🧪 Création des tests Portfolio..."
cat > tests/portfolio.test.tsx <<'EOF'
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioPage from '@/app/portfolio/page';

// Mock the store
vi.mock('@/store/portfolio', () => ({
  usePortfolioStore: () => ({
    positions: [
      {
        id: '1',
        symbol: 'AAPL',
        qty: 100,
        avgPrice: 150.00,
        marketPrice: 175.50,
        pnl: 2550.00,
        pnlPct: 17.00,
        sector: 'Technology',
        updatedAt: new Date().toISOString(),
      },
    ],
    summary: {
      equity: 125000.00,
      cash: 15000.00,
      dayPnl: 1250.00,
      dayPnlPct: 1.01,
      allTimePnl: 3497.50,
    },
    isLoading: false,
    error: null,
    setPositions: vi.fn(),
    setSummary: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  }),
}));

describe('PortfolioPage', () => {
  it('renders portfolio summary cards', async () => {
    render(<PortfolioPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Équité Totale')).toBeInTheDocument();
      expect(screen.getByText('$125,000')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
      expect(screen.getByText('$15,000')).toBeInTheDocument();
    });
  });

  it('renders positions table', async () => {
    render(<PortfolioPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Positions')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('$2,550.00')).toBeInTheDocument();
    });
  });

  it('renders chart component', async () => {
    render(<PortfolioPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});
EOF

# --- tests/history.test.tsx ---
echo "🧪 Création des tests Historique..."
cat > tests/history.test.tsx <<'EOF'
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HistoryPage from '@/app/history/page';

describe('HistoryPage', () => {
  it('renders history page title', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Historique des Transactions')).toBeInTheDocument();
    });
  });

  it('renders filters section', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('AAPL, TSLA...')).toBeInTheDocument();
    });
  });

  it('renders transactions table', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('BUY')).toBeInTheDocument();
    });
  });
});
EOF

# --- package.json updates ---
echo "📦 Mise à jour du package.json..."
cat >> package.json <<'EOF'

  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
EOF

# --- Final message ---
echo ""
echo "🎉 Bootstrap Trading Suite terminé !"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Installe les dépendances:"
echo "   pnpm add lightweight-charts @tanstack/react-table zustand zod sonner date-fns clsx"
echo "   pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom"
echo ""
echo "2. Lance l'application:"
echo "   npm run dev"
echo ""
echo "3. Visite les pages:"
echo "   - http://localhost:3000/portfolio"
echo "   - http://localhost:3000/history"
echo ""
echo "4. Lance les tests:"
echo "   npm test"
echo ""
echo "✨ Trading Suite prêt pour le développement !"
