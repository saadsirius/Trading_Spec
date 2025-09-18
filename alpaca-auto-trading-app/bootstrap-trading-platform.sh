#!/usr/bin/env bash
set -euo pipefail

### 0) Garde-fous & utilitaires
project_root="$(pwd)"
echo "🚀 Setup Alpaca+TV/Bybit/InvestingWarriors starter @ $project_root"

backup_if_exists () {
  local f="$1"
  if [ -f "$f" ]; then cp -f "$f" "$f.bak"; echo "🗃️  Backup $f -> $f.bak"; fi
  mkdir -p "$(dirname "$f")"
}

write_file () {
  local f="$1"
  backup_if_exists "$f"
  cat > "$f"
  echo "✍️  Wrote $f"
}

append_json_script () {
  local pkg="package.json"
  if [ -f "$pkg" ]; then
    node - <<'NODE'
const fs=require('fs');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.scripts = Object.assign({
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "metrics": "node ./src/server/metrics.ts",
  "check": "npm run typecheck && npm run lint && npm run test"
}, pkg.scripts||{});
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2));
console.log('🧩 package.json scripts ensured');
NODE
  fi
}

### 1) Dépendances
echo "📦 Installing deps..."
# UI & charts & state
npm i -D typescript @types/node
npm i zustand @tanstack/react-query @tanstack/react-query-devtools \
  recharts lightweight-charts classnames react-hot-toast
# validation & errors
npm i zod neverthrow
# date & utils
npm i date-fns d3-array d3-format
# news/sentiment & http
npm i ofetch vader-sentiment
# logs & metrics
npm i pino pino-pretty prom-client
# notifications push & mail (optionnel)
npm i web-push nodemailer
# testing
npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
# env
npm i dotenv

### 2) .env example
write_file ".env.local.example" <<'ENV'
# === Alpaca / Providers (met en .env.local réel) ===
APCA_API_KEY_ID=your_key
APCA_API_SECRET_KEY=your_secret
APCA_BASE_URL=https://paper-api.alpaca.markets

POLYGON_API_KEY=your_polygon
FINNHUB_API_KEY=your_finnhub
NEWSAPI_KEY=your_newsapi
TRAD_ECON_API_KEY=your_trading_econ  # si besoin

# Web Push (facultatif)
WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_CONTACT=mailto:you@example.com

# Nodemailer (facultatif)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
ENV

### 3) .cursorrules (JSON propre pour éviter TS errors)
write_file ".cursorrules" <<'CURSOR'
{
  "version": 1,
  "goals": [
    "Garder le cap: reproduire Trading212/TradingView UX pour moi seul, avec backtesting sandbox, screener, radar facteurs (Momentum, Value, Quality, Risk, Growth), news/sentiment réel, calendrier (earnings + macro), watchlist + alertes IA, historique Bybit-like, PnL journalier cumulé, observabilité.",
    "Toujours générer du code strictement typé TypeScript/Next.js (app/), testable (Vitest/RTL), traçable (logs pino), robuste (zod/neverthrow), et prêt pour prod.",
    "Charts niveau pro: Lightweight Charts pour prix; Recharts pour radar et PnL cumulé. Pas de couleurs criardes; cohérence dark/light."
  ],
  "constraints": [
    "Ne jamais appeler directement les API providers depuis les composants UI. Passer par /src/lib/api/* et services.",
    "Valider tout input réseau avec zod. Propager des Neverthrow Results (ok/err). Logger chaque erreur avec pino.",
    "Éviter l'état global superflu; utiliser Zustand pour watchlist/alertes; React Query pour côté données réseau.",
    "Toutes les pages doivent build, avoir placeholders s'il manque des clés API.",
    "Respecter A11y (aria-*), fallback textuels, skeletons."
  ],
  "style": {
    "components": ["modulaires", "petits", "SRP"],
    "naming": "camelCase pour funcs/vars, PascalCase pour composants",
    "folders": "src/app, src/lib, src/services, src/server, src/components, src/state, src/types"
  },
  "tests": {
    "policy": "Pour chaque util core, tests unitaires rapides; pour pages, tests smoke (render)."
  }
}
CURSOR

### 4) Types
write_file "src/types/market.ts" <<'TS'
export type Mode = 'paper'|'live';

export interface Bar {
  t: string; // ISO
  o: number; h: number; l: number; c: number; v?: number;
}

export interface NewsItem {
  id: string;
  source: string;
  symbol?: string;
  headline: string;
  summary?: string;
  url?: string;
  publishedAt: string; // ISO
  sentiment?: number; // -1..+1
}

export interface CalendarEvent {
  id: string;
  kind: 'earning'|'macro';
  title: string;
  symbol?: string;
  country?: string;
  date: string; // ISO
  actual?: string|number;
  forecast?: string|number;
  previous?: string|number;
  importance?: 'low'|'medium'|'high';
}

export interface Factors {
  momentum: number; // 0..100
  value: number;
  quality: number;
  risk: number;   // inversé => plus haut = mieux
  growth: number;
}

export interface PnLPoint {
  date: string; // ISO day
  pnl: number;  // jour
}

export interface Trade {
  ts: string; // ISO
  symbol: string;
  side: 'buy'|'sell';
  qty: number;
  price: number;
  fee?: number;
}

export interface BacktestMetrics {
  cagr: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
}
TS

### 5) API clients (providers)
write_file "src/lib/api/providers.ts" <<'TS'
import { ofetch } from 'ofetch';

const env = {
  polygon: process.env.POLYGON_API_KEY,
  finnhub: process.env.FINNHUB_API_KEY,
  newsapi: process.env.NEWSAPI_KEY,
  tradEcon: process.env.TRAD_ECON_API_KEY
};

export const polygon = ofetch.create({
  baseURL: 'https://api.polygon.io',
  query: { apiKey: env.polygon }
});

export const finnhub = ofetch.create({
  baseURL: 'https://finnhub.io/api/v1',
  query: { token: env.finnhub }
});

export const newsapi = ofetch.create({
  baseURL: 'https://newsapi.org/v2',
  headers: env.newsapi ? { 'X-Api-Key': env.newsapi } : {}
});

// TradingEconomics public endpoints demand key in path or headers selon plan.
// Ici on passe par query si dispo:
export const tradingEcon = ofetch.create({
  baseURL: 'https://api.tradingeconomics.com',
  query: env.tradEcon ? { c: env.tradEcon } : {}
});
TS

### 6) Sentiment service (VADER + mapping)
write_file "src/services/sentiment.ts" <<'TS'
import vader from 'vader-sentiment';
import type { NewsItem } from '@/src/types/market';

export function scoreText(text: string): number {
  if (!text) return 0;
  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  // compound déjà -1..+1
  return Math.max(-1, Math.min(1, intensity.compound));
}

export function enrichSentiment(item: NewsItem): NewsItem {
  if (typeof item.sentiment === 'number') return item;
  const base = `${item.headline} ${item.summary||''}`;
  return { ...item, sentiment: scoreText(base) };
}

// simple provider mapping fallback (si pas de VADER dispo côté edge)
export function providerBias(source: string): number {
  const s = source.toLowerCase();
  if (s.includes('seekingalpha')) return 0.05;
  if (s.includes('wsj')) return 0.02;
  return 0;
}
TS

### 7) Facteurs radar (Investing Warriors-like)
write_file "src/services/factors.ts" <<'TS'
import type { Factors } from '@/src/types/market';
import { clamp } from '@/src/utils/num';

const toPercentile = (x: number, min: number, max: number) => clamp(((x - min) / (max - min)) * 100, 0, 100);
const invNorm = (x: number, min: number, max: number) => clamp(((max - x) / (max - min)) * 100, 0, 100);

export interface Fundamentals {
  perf6m: number; // %
  perf12m: number; // %
  evToEbitda: number;
  pb: number;
  pe: number;
  roe: number; // %
  roic: number; // %
  netMargin: number; // %
  epsStdDev?: number; // volatilité earnings
  vol30: number; // %
  vol90: number; // %
  maxDrawdown: number; // % négatif
  revCAGR3y?: number; // %
  epsCAGR3y?: number; // %
}

export function computeFactors(f: Fundamentals): Factors {
  const momentum = (toPercentile(f.perf6m, -50, 100) * 0.4) + (toPercentile(f.perf12m, -80, 150) * 0.6);
  const value = (invNorm(f.evToEbitda, 2, 40)*0.4) + (invNorm(f.pb, 0.5, 15)*0.3) + (invNorm(f.pe, 3, 60)*0.3);
  const quality = (toPercentile(f.roe, -10, 40)*0.4) + (toPercentile(f.roic, -5, 30)*0.3) + (toPercentile(f.netMargin, -20, 40)*0.3);
  const risk = (invNorm(f.vol30, 5, 120)*0.4) + (invNorm(f.vol90, 5, 140)*0.3) + (invNorm(Math.abs(f.maxDrawdown), 5, 85)*0.3);
  const growth = (toPercentile(f.revCAGR3y ?? 0, -10, 60)*0.5) + (toPercentile(f.epsCAGR3y ?? 0, -20, 80)*0.5);
  return {
    momentum: clamp(momentum,0,100),
    value: clamp(value,0,100),
    quality: clamp(quality,0,100),
    risk: clamp(risk,0,100),
    growth: clamp(growth,0,100)
  };
}
TS

### 8) Utils
write_file "src/utils/num.ts" <<'TS'
export const clamp = (x:number,min:number,max:number)=> Math.min(max, Math.max(min,x));
export const pct = (a:number,b:number)=> b===0?0:((a-b)/b)*100;
TS

### 9) News + Calendar fetchers
write_file "src/lib/api/news.ts" <<'TS'
import type { NewsItem } from '@/src/types/market';
import { polygon, finnhub, newsapi } from './providers';
import { enrichSentiment, providerBias } from '@/src/services/sentiment';

export async function fetchNews(symbol?: string): Promise<NewsItem[]> {
  const out: NewsItem[] = [];
  try {
    // Polygon ticker news
    if (symbol) {
      const p = await polygon(`/v2/reference/news`, { query: { ticker: symbol, limit: 20 } });
      (p?.results||[]).forEach((n:any)=> out.push({
        id: `poly_${n.id}`, source: n.publisher?.name || 'polygon',
        symbol, headline: n.title, summary: n.description, url: n.article_url, publishedAt: n.published_utc
      }));
    }
  } catch(e){/* silent, we have fallbacks */ }

  try {
    // Finnhub general news (fallback)
    const f = await finnhub('/news', { query: { category: 'general' }});
    f?.forEach((n:any)=> out.push({
      id: `fin_${n.id}`, source: 'finnhub', headline: n.headline, summary: n.summary,
      url: n.url, publishedAt: new Date(n.datetime*1000).toISOString()
    }));
  } catch(e){}

  try {
    // NewsAPI top-headlines (fallback)
    const q = symbol ? `${symbol} stock OR ${symbol} earnings` : 'markets OR stocks';
    const n = await newsapi('/everything', { query: { q, sortBy: 'publishedAt', pageSize: 20 }});
    n?.articles?.forEach((a:any, idx:number)=> out.push({
      id: `news_${idx}_${a.publishedAt}`, source: a.source?.name || 'newsapi',
      headline: a.title, summary: a.description, url: a.url, publishedAt: a.publishedAt
    }));
  } catch(e){}

  // Sentiment enrich
  const enriched = out
    .sort((a,b)=> (b.publishedAt||'').localeCompare(a.publishedAt||''))
    .map(n => {
      const base = enrichSentiment(n);
      return { ...base, sentiment: Math.max(-1, Math.min(1, (base.sentiment ?? 0) + providerBias(base.source))) };
    });

  // de-dup roughly by headline+time
  const uniq: Record<string, NewsItem> = {};
  for (const n of enriched) uniq[`${(n.headline||'').slice(0,80)}|${n.publishedAt}`]=n;
  return Object.values(uniq).slice(0,50);
}
TS

write_file "src/lib/api/calendar.ts" <<'TS'
import type { CalendarEvent } from '@/src/types/market';
import { polygon, finnhub, tradingEcon } from './providers';

export async function fetchEarnings(symbol?: string): Promise<CalendarEvent[]> {
  const res: CalendarEvent[] = [];
  try {
    if (symbol) {
      const p = await polygon('/vX/reference/financials', { query: { ticker: symbol, limit: 1 }});
      // polygon earnings endpoints varient selon plan; on fallback Finnhub ci-dessous.
    }
  } catch(e){}

  try {
    const f = await finnhub('/calendar/earnings', { query: { from: getISO(-10), to: getISO(20) }});
    (f?.earningsCalendar||[]).forEach((it:any)=> {
      res.push({
        id: `earn_${it.symbol}_${it.date}`,
        kind: 'earning',
        title: `${it.symbol} earnings`,
        symbol: it.symbol,
        date: it.date,
        actual: it.actualEPS,
        forecast: it.estimate,
        previous: it.prevActualEPS,
        importance: 'high'
      });
    });
  } catch(e){}
  return res;
}

export async function fetchMacro(): Promise<CalendarEvent[]> {
  const res: CalendarEvent[] = [];
  try {
    const m = await tradingEcon('/calendar', { query: {  }});
    (m||[]).slice(0,200).forEach((ev:any, i:number)=> {
      res.push({
        id: `macro_${i}_${ev.Date || ev.Event}`,
        kind: 'macro',
        title: ev.Event || ev.Category || 'Macro Event',
        country: ev.Country,
        date: ev.Date || new Date().toISOString(),
        actual: ev.Actual,
        forecast: ev.Forecast,
        previous: ev.Previous,
        importance: (ev.Importance||'low').toLowerCase()
      });
    });
  } catch(e){}
  return res;
}

function getISO(offsetDays:number){
  const d=new Date(); d.setDate(d.getDate()+offsetDays);
  return d.toISOString().slice(0,10);
}
TS

### 10) PnL & Backtesting
write_file "src/services/pnl.ts" <<'TS'
import type { PnLPoint, Trade, BacktestMetrics } from '@/src/types/market';
import { clamp } from '@/src/utils/num';
import { mean, deviation } from 'd3-array';

export function aggregateDailyPnL(trades: Trade[]): PnLPoint[] {
  const byDay = new Map<string, number>();
  for (const t of trades) {
    const day = (t.ts||'').slice(0,10);
    const cash = (t.side==='sell' ? 1 : -1) * (t.qty * t.price) - (t.fee||0);
    byDay.set(day, (byDay.get(day)||0) + cash);
  }
  return Array.from(byDay.entries()).sort((a,b)=> a[0].localeCompare(b[0])).map(([date,pnl])=>({date,pnl}));
}

export function cumulative(points: PnLPoint[]): PnLPoint[] {
  let acc=0;
  return points.map(p=> ({ date: p.date, pnl: (acc+=p.pnl) }));
}

export function backtestMetrics(equityCurve: number[], riskFreeRate=0): BacktestMetrics {
  // equityCurve: valeurs cumulées jour après jour
  const rets:number[]=[];
  for (let i=1;i<equityCurve.length;i++){
    const r = (equityCurve[i]-equityCurve[i-1])/(equityCurve[i-1]||1);
    rets.push(r);
  }
  const annFactor = 252;
  const avg = mean(rets)||0;
  const vol = deviation(rets)||0;
  const downside = deviation(rets.filter(r=> r<0)) || 1e-9;
  const sharpe = (avg - riskFreeRate/annFactor) / (vol||1e-9) * Math.sqrt(annFactor);
  const sortino = (avg - riskFreeRate/annFactor) / (downside||1e-9) * Math.sqrt(annFactor);
  let peak = equityCurve[0]||0, mdd=0;
  for (const v of equityCurve){
    peak = Math.max(peak, v);
    mdd = Math.min(mdd, (v-peak)/peak);
  }
  const cagr = Math.pow((equityCurve.at(-1)||1)/(equityCurve[0]||1), (252/equityCurve.length)) - 1;
  const wins = rets.filter(r=> r>0).length;
  return {
    cagr, sharpe, sortino, maxDrawdown: Math.abs(mdd||0)*100, winRate: (wins/Math.max(1,rets.length))*100, trades: rets.length
  };
}
TS

### 11) Zustand: Watchlist & Alertes IA
write_file "src/state/watchlist.ts" <<'TS'
import { create } from 'zustand';

type AlertRule =
 | { kind:'sentiment'; symbol:string; threshold:number }     // -1..+1
 | { kind:'volatility'; symbol:string; days:30|90; threshold:number } // %
 | { kind:'breakout'; symbol:string; lookback:number; }      // Donchian high

interface WatchlistState {
  symbols: string[];
  alerts: AlertRule[];
  addSymbol: (s:string)=>void;
  removeSymbol: (s:string)=>void;
  addAlert: (a:AlertRule)=>void;
  removeAlert: (idx:number)=>void;
}

export const useWatchlist = create<WatchlistState>((set)=>({
  symbols: [],
  alerts: [],
  addSymbol: (s)=> set((st)=> st.symbols.includes(s) ? st : ({...st, symbols:[...st.symbols,s]})),
  removeSymbol: (s)=> set((st)=> ({...st, symbols: st.symbols.filter(x=>x!==s)})),
  addAlert: (a)=> set((st)=> ({...st, alerts:[...st.alerts, a]})),
  removeAlert: (idx)=> set((st)=> ({...st, alerts: st.alerts.filter((_,i)=> i!==idx)}))
}));
TS

### 12) Observabilité: logs + métriques
write_file "src/server/logger.ts" <<'TS'
import pino from 'pino';
export const logger = pino({ level: process.env.NODE_ENV==='production'?'info':'debug', transport: process.env.NODE_ENV==='production'?undefined:{ target:'pino-pretty' }});
TS

write_file "src/server/metrics.ts" <<'TS'
import express from 'express';
import prom from 'prom-client';
const app = express();
const register = new prom.Registry();
prom.collectDefaultMetrics({ register });
app.get('/metrics', async (_req,res)=> {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
const port = process.env.METRICS_PORT || 9300;
app.listen(port, ()=> console.log(`📈 metrics on :${port}/metrics`));
TS

### 13) UI Components: PnL chart, Radar, Split panels
write_file "src/components/charts/PnLCumulated.tsx" <<'TSX'
'use client';
import { PnLPoint } from '@/src/types/market';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PnLCumulated({ data }: { data: PnLPoint[] }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24}/>
          <YAxis tickFormatter={(v)=> (v>1e6? (v/1e6).toFixed(1)+'M': v>1e3? (v/1e3).toFixed(1)+'k': v.toFixed(0))}/>
          <Tooltip formatter={(v)=> Number(v).toFixed(2)} />
          <Line type="monotone" dataKey="pnl" dot={false} strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
TSX

write_file "src/components/charts/FactorsRadar.tsx" <<'TSX'
'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Factors } from '@/src/types/market';

export default function FactorsRadar({ f }: { f: Factors }) {
  const data = [
    { k: 'Momentum', v: f.momentum },
    { k: 'Value', v: f.value },
    { k: 'Quality', v: f.quality },
    { k: 'Risk', v: f.risk },
    { k: 'Growth', v: f.growth }
  ];
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="k" />
          <PolarRadiusAxis angle={30} domain={[0,100]} />
          <Tooltip />
          <Radar dataKey="v" strokeWidth={2} fillOpacity={0.2}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
TSX

write_file "src/components/NewsList.tsx" <<'TSX'
'use client';
import type { NewsItem } from '@/src/types/market';
import clsx from 'classnames';

export default function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="divide-y divide-neutral-800">
      {items.map(n=> (
        <li key={n.id} className="py-3">
          <a href={n.url} target="_blank" className="font-medium hover:underline">{n.headline}</a>
          <div className="text-sm opacity-80">{new Date(n.publishedAt).toLocaleString()} · {n.source}</div>
          {typeof n.sentiment==='number' && (
            <div className={clsx("text-sm font-semibold", n.sentiment>0.1?'text-green-500': n.sentiment<-0.1?'text-red-500':'text-yellow-500')}>
              Sentiment: {n.sentiment.toFixed(2)}
            </div>
          )}
          {n.summary && <p className="text-sm opacity-90 mt-1">{n.summary}</p>}
        </li>
      ))}
    </ul>
  );
}
TSX

write_file "src/components/CalendarList.tsx" <<'TSX'
'use client';
import type { CalendarEvent } from '@/src/types/market';

export default function CalendarList({ items }: { items: CalendarEvent[] }) {
  return (
    <div className="space-y-3">
      {items.map(ev=> (
        <div key={ev.id} className="p-3 rounded-md border border-neutral-800">
          <div className="text-sm opacity-70">{new Date(ev.date).toLocaleString()} · {ev.kind.toUpperCase()}</div>
          <div className="font-semibold">{ev.title}{ev.symbol?` (${ev.symbol})`:''}</div>
          <div className="text-sm opacity-80">Actual: {ev.actual??'-'} · Forecast: {ev.forecast??'-'} · Prev: {ev.previous??'-'}</div>
          {ev.country && <div className="text-xs opacity-60">{ev.country} · {ev.importance}</div>}
        </div>
      ))}
    </div>
  );
}
TSX

### 14) Historical page (Bybit-like + split News/Sentiment/Calendar)
write_file "src/app/historique/page.tsx" <<'TSX'
import 'dotenv/config';
import { fetchNews } from '@/src/lib/api/news';
import { fetchEarnings, fetchMacro } from '@/src/lib/api/calendar';
import { aggregateDailyPnL, cumulative } from '@/src/services/pnl';
import PnLCumulated from '@/src/components/charts/PnLCumulated';
import NewsList from '@/src/components/NewsList';
import CalendarList from '@/src/components/CalendarList';

// Mock trades demo; remplace par tes trades réels (ou via API interne)
const demoTrades = [
  { ts: '2025-01-02T13:00:00Z', symbol:'AAPL', side:'buy',  qty:10, price:180 },
  { ts: '2025-01-05T13:00:00Z', symbol:'AAPL', side:'sell', qty:10, price:184 },
  { ts: '2025-01-08T13:00:00Z', symbol:'NVDA', side:'buy',  qty:5,  price:500 },
  { ts: '2025-01-20T13:00:00Z', symbol:'NVDA', side:'sell', qty:5,  price:470 },
] as const;

export default async function HistoriquePage({ searchParams }: { searchParams: { symbol?: string } }) {
  const symbol = searchParams?.symbol || 'AAPL';

  // PnL journalier (mock)
  const daily = aggregateDailyPnL(demoTrades as any);
  const cumu = cumulative(daily);

  // News + Calendar (providers avec fallbacks)
  const [news, earn, macro] = await Promise.all([
    fetchNews(symbol),
    fetchEarnings(symbol),
    fetchMacro()
  ]);
  const calendar = [...earn, ...macro].sort((a,b)=> (a.date||'').localeCompare(b.date||''));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Historique & Analyse</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">PnL Cumulé (Journalier)</h2>
        <PnLCumulated data={cumu}/>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold">News & Sentiment ({symbol})</h2>
          <div className="mt-3"><NewsList items={news}/></div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Calendar (Earnings + Macro)</h2>
          <div className="mt-3"><CalendarList items={calendar}/></div>
        </div>
      </section>
    </div>
  );
}
TSX

### 15) Page Radar facteurs par symbole
write_file "src/app/symbol/[ticker]/page.tsx" <<'TSX'
import 'dotenv/config';
import FactorsRadar from '@/src/components/charts/FactorsRadar';
import { computeFactors } from '@/src/services/factors';

export default async function SymbolPage({ params }: { params: { ticker: string } }) {
  const { ticker } = params;

  // TODO: remplace par fetch de tes fondamentaux (Polygon, Finnhub) puis computeFactors
  const f = computeFactors({
    perf6m: 22, perf12m: 48, evToEbitda: 18, pb: 9, pe: 35,
    roe: 18, roic: 12, netMargin: 20, vol30: 40, vol90: 55, maxDrawdown: -28,
    revCAGR3y: 24, epsCAGR3y: 30
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{ticker} · Pentagone (Investing Warriors)</h1>
      <FactorsRadar f={f}/>
    </div>
  );
}
TSX

### 16) Portfolio (rappels: ce que tu veux voir)
write_file "src/app/portfolio/page.tsx" <<'TSX'
export default function PortfolioPage(){
  // TODO brancher tes positions Alpaca & PnL réel ici
  const kpis = [
    { k:'Valeur Totale', v:'$100,000' },
    { k:'PnL Jour', v:'+ $420' },
    { k:'PnL MTD', v:'+ $2,100' },
    { k:'CAGR (Backtest)', v:'18.5%' },
    { k:'Max DD', v:'-12.8%' },
  ];
  const allocations = [
    { k:'Tech', v:42 }, { k:'Health', v:18 }, { k:'Energy', v:12 }, { k:'Cash', v:28 }
  ];
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Portfolio</h1>
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map(x=>(
          <div key={x.k} className="p-4 rounded-md border border-neutral-800">
            <div className="text-xs opacity-70">{x.k}</div>
            <div className="text-lg font-semibold">{x.v}</div>
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Allocations</h2>
        <div className="text-sm opacity-80">Tech 42% · Health 18% · Energy 12% · Cash 28%</div>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Watchlist & Alertes</h2>
        <div className="text-sm opacity-70">Ajoute tes symboles sur /historique?symbol=XYZ et configure règles dans l'état Zustand (src/state/watchlist.ts).</div>
      </section>
    </div>
  );
}
TSX

### 17) Tests smoke
write_file "src/app/historique/page.test.tsx" <<'TS'
import { describe, it, expect } from 'vitest';
import HistoriquePage from './page';

describe('HistoriquePage', ()=>{
  it('renders server component', async ()=>{
    const comp = await HistoriquePage({ searchParams: { symbol:'AAPL' } } as any);
    expect(comp).toBeTruthy();
  });
});
TS

### 18) ESLint/Prettier config minimal si absent
if [ ! -f ".eslintrc.json" ]; then
write_file ".eslintrc.json" <<'JSON'
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@next/next/no-img-element": "off"
  }
}
JSON
fi

if [ ! -f ".prettierrc" ]; then
write_file ".prettierrc" <<'JSON'
{ "semi": true, "singleQuote": true, "printWidth": 100 }
JSON
fi

### 19) Raccourcis dev: README
write_file "README.CURSOR.md" <<'MD'
# Cursor Runbook — Trading App Enhancements

- **Historique**: `/historique?symbol=AAPL` — PnL cumulé + News/Sentiment + Calendar (earnings & macro)
- **Pentagone facteurs**: `/symbol/AAPL` — Momentum, Value, Quality, Risk, Growth
- **Portfolio**: `/portfolio` — KPIs + alloc + watchlist/alertes hints

## Brancher données réelles
- Ajoute tes clés dans `.env.local` (copie de `.env.local.example`)
- Remplace mocks par appels Alpaca/Polygon/Finnhub dans `src/lib/api/*`
- Calcule PnL réel via tes exécutions (webhook/DB) et passe-les à `aggregateDailyPnL` puis `cumulative`

## Alertes IA (Zustand)
- Définis tes règles dans `src/state/watchlist.ts`
- Plan: un cron côté server pour évaluer règles & pousser web-push/email + toast côté UI

## Observabilité
- Logs pino partout où ça peut échouer
- `npm run metrics` démarre `/metrics` Prometheus

## Qualité
- `npm run check` = typecheck + lint + tests
MD

### 20) Final: scripts & tips
append_json_script

echo "✅ Done.
- Mets tes clés dans .env.local (copie .env.local.example)
- Lance: npm run dev
- Vérifs: npm run check
- Pages: /historique?symbol=AAPL, /symbol/AAPL, /portfolio
"
