# 🧠 Knowledge Extract

*Generated on 2025-09-19T19:10:02.196Z*

## 🔧 Services & Functions


### fetchBars
- **File**: `src/components/AIAnalysisPanel.tsx`
- **Methods**:
  - `fetchBars(symbol: string, timeframe: string, limit: number)` → `Promise<Bar[]>`
    > *async function*

### AIAnalysisPanel
- **File**: `src/components/AIAnalysisPanel.tsx`
- **Methods**:
  - `AIAnalysisPanel({ symbol }: { symbol: string; })` → `React.JSX.Element`

### fetchBars
- **File**: `src/components/AISidePanel.tsx`
- **Methods**:
  - `fetchBars(symbol: string, timeframe: string, limit: number)` → `Promise<Bar[]>`
    > *async function*

### AISidePanel
- **File**: `src/components/AISidePanel.tsx`
- **Methods**:
  - `AISidePanel()` → `React.JSX.Element | null`

### AdvisorChat
- **File**: `src/components/AdvisorChat.tsx`
- **Methods**:
  - `AdvisorChat()` → `React.JSX.Element`

### labelAction
- **File**: `src/components/AdvisorChat.tsx`
- **Methods**:
  - `labelAction(a: "buy" | "add" | "trim" | "hold" | "watch")` → `"Acheter" | "Renforcer" | "Alléger" | "Vendre" | "Observer"`

### AnimatedNavLink
- **File**: `src/components/AnimatedNavbar.tsx`
- **Methods**:
  - `AnimatedNavLink({ href, children, className = '' }: NavLinkProps)` → `React.JSX.Element`

### AnimatedNavbar
- **File**: `src/components/AnimatedNavbar.tsx`
- **Methods**:
  - `AnimatedNavbar()` → `React.JSX.Element`

### CalendarList
- **File**: `src/components/CalendarList.tsx`
- **Methods**:
  - `CalendarList({ items }: { items: CalendarEvent[]; })` → `React.JSX.Element`

### ChartPanel
- **File**: `src/components/ChartPanel.tsx`
- **Methods**:
  - `ChartPanel({ symbol }: { symbol: string; })` → `React.JSX.Element`

### ChartTV
- **File**: `src/components/ChartTV.tsx`
- **Methods**:
  - `ChartTV({ symbol, timeframe = '1Day' }: ChartTVProps)` → `React.JSX.Element`

### loadHistory
- **File**: `src/components/CommandPalette.tsx`
- **Methods**:
  - `loadHistory()` → `string[]`

### saveHistory
- **File**: `src/components/CommandPalette.tsx`
- **Methods**:
  - `saveHistory(ids: string[])` → `void`

### loadPins
- **File**: `src/components/CommandPalette.tsx`
- **Methods**:
  - `loadPins()` → `string[]`

### savePins
- **File**: `src/components/CommandPalette.tsx`
- **Methods**:
  - `savePins(ids: string[])` → `void`

### fetchSymbols
- **File**: `src/components/CommandPalette.tsx`
- **Methods**:
  - `fetchSymbols(q: string)` → `Promise<AssetLite[]>`
    > *async function*

### CommandPalette
- **File**: `src/components/CommandPalette.tsx`
- **Methods**:
  - `CommandPalette()` → `React.JSX.Element | null`

### NavLink
- **File**: `src/components/NavLink.tsx`
- **Methods**:
  - `NavLink({
  href,
  children,
  exact = false,
}: { href: string; children: React.ReactNode; exact?: boolean | undefined; })` → `React.JSX.Element`

### Navbar
- **File**: `src/components/Navbar.tsx`
- **Methods**:
  - `Navbar()` → `React.JSX.Element`

### Navigation
- **File**: `src/components/Navigation.tsx`
- **Methods**:
  - `Navigation()` → `React.JSX.Element`

### NewsList
- **File**: `src/components/NewsList.tsx`
- **Methods**:
  - `NewsList({ items }: { items: NewsItem[]; })` → `React.JSX.Element`

### Projections
- **File**: `src/components/Projections.tsx`
- **Methods**:
  - `Projections({ startValue, years, annualReturn, annualVol, monthlyContribution=0, paths=50 }: Props)` → `React.JSX.Element`

### boxMuller
- **File**: `src/components/Projections.tsx`
- **Methods**:
  - `boxMuller()` → `number`

### percentile
- **File**: `src/components/Projections.tsx`
- **Methods**:
  - `percentile(a: number[], p: number)` → `number`

### Providers
- **File**: `src/components/Providers.tsx`
- **Methods**:
  - `Providers({ children }: { children: React.ReactNode; })` → `React.JSX.Element`

### RightPanelAlerts
- **File**: `src/components/RightPanelAlerts.tsx`
- **Methods**:
  - `RightPanelAlerts({ symbol }: { symbol: string; })` → `React.JSX.Element`

### SearchSymbol
- **File**: `src/components/SearchSymbol.tsx`
- **Methods**:
  - `SearchSymbol()` → `React.JSX.Element`

### StickyNavbar
- **File**: `src/components/StickyNavbar.tsx`
- **Methods**:
  - `StickyNavbar({ children }: StickyNavbarProps)` → `React.JSX.Element`

### ThemeToggle
- **File**: `src/components/ThemeToggle.tsx`
- **Methods**:
  - `ThemeToggle()` → `React.JSX.Element`

### ToastRail
- **File**: `src/components/ToastRail.tsx`
- **Methods**:
  - `ToastRail()` → `React.JSX.Element`

### Card
- **File**: `src/design-system/atoms.tsx`
- **Methods**:
  - `Card({ children, hover = true, id }: { children: React.ReactNode; hover?: boolean | undefined; id?: string | undefined; })` → `React.JSX.Element`

### Kpi
- **File**: `src/design-system/atoms.tsx`
- **Methods**:
  - `Kpi({ label, value, hint }: { label: string; value: string; hint?: string | undefined; })` → `React.JSX.Element`

### MoodBar
- **File**: `src/design-system/atoms.tsx`
- **Methods**:
  - `MoodBar()` → `React.JSX.Element`

### calculateVolatility
- **File**: `src/hooks/useAIAlerts.ts`
- **Methods**:
  - `calculateVolatility(prices: number[])` → `number`

### OverviewAggregator
- **File**: `src/lib/overview.ts`
- **Exported**: ✅
- **Methods**:
  - `getKPIs()` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").KPI>`
    > *async function*
  - `getEquityCurve()` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").CurvePoint[]>`
    > *async function*
  - `getPositions()` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").PositionRow[]>`
    > *async function*
  - `getOrders()` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").OrderRow[]>`
    > *async function*
  - `getWatchlist()` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").WatchItem[]>`
    > *async function*
  - `getNotifications()` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").NotificationRow[]>`
    > *async function*
  - `getOverviewData()` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").OverviewPayload>`
    > *async function*
  - `getAccountData()` → `Promise<{ equity: number; cash: number; marginUsed: number; } | null>`
    > *async function*

### RateLimiter
- **File**: `src/lib/rateLimit.ts`
- **Exported**: ✅
- **Methods**:
  - `isAllowed(key: string)` → `boolean`
  - `getTimeUntilReset(key: string)` → `number`
  - `getRemainingRequests(key: string)` → `number`

### withReqId
- **File**: `src/mw/log.ts`
- **Methods**:
  - `withReqId(init?: RequestInit | undefined)` → `RequestInit`

### getReqId
- **File**: `src/mw/log.ts`
- **Methods**:
  - `getReqId(headers: Headers)` → `string`

### verifyHmac
- **File**: `src/mw/validate.ts`
- **Methods**:
  - `verifyHmac(raw: string, sigHeader?: string | undefined)` → `boolean`

### register
- **File**: `src/plugins/index.ts`
- **Methods**:
  - `register(p: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/plugins/index").Provider)` → `void`

### resolve
- **File**: `src/plugins/index.ts`
- **Methods**:
  - `resolve(pathname: string)` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/plugins/index").Provider | undefined`

### list
- **File**: `src/plugins/index.ts`
- **Methods**:
  - `list()` → `string[]`

### enqueueAI
- **File**: `src/queue/index.ts`
- **Methods**:
  - `enqueueAI(name: string, payload: any, opts: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/bullmq/dist/esm/types/job-options").JobsOptions)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/bullmq/dist/esm/classes/job").Job<any, any, string>>`
    > *async function*

### enqueueBT
- **File**: `src/queue/index.ts`
- **Methods**:
  - `enqueueBT(name: string, payload: any, opts: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/bullmq/dist/esm/types/job-options").JobsOptions)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/bullmq/dist/esm/classes/job").Job<any, any, string>>`
    > *async function*

### loadRules
- **File**: `src/services/AlertService.ts`
- **Methods**:
  - `loadRules()` → `void`

### saveRules
- **File**: `src/services/AlertService.ts`
- **Methods**:
  - `saveRules()` → `void`

### scoreFromSignals
- **File**: `src/services/AlertService.ts`
- **Methods**:
  - `scoreFromSignals(s: { rsi?: number | undefined; adx?: number | undefined; donchianBreak?: boolean | undefined; })` → `number`

### ClickHandlerService
- **File**: `src/services/ClickHandlerService.ts`
- **Exported**: ✅
- **Methods**:
  - `submitOrder(orderData: { symbol: string; type: "market" | "limit" | "stop" | "stop_limit"; qty: number; side: "buy" | "sell"; time_in_force: "day" | "gtc" | "opg" | "cls" | "ioc" | "fok"; limit_price?: number | undefined; stop_price?: number | undefined; client_order_id?: string | undefined; })` → `Promise<boolean>`
    > *async function*
  - `cancelOrder(orderId: string)` → `Promise<boolean>`
    > *async function*
  - `refreshPositions()` → `Promise<boolean>`
    > *async function*
  - `refreshAccount()` → `Promise<boolean>`
    > *async function*
  - `getIsSubmitting()` → `boolean`

### computeFactors
- **File**: `src/services/factors.ts`
- **Methods**:
  - `computeFactors(f: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/services/factors").Fundamentals)` → `Factors`

### aggregateDailyPnL
- **File**: `src/services/pnl.ts`
- **Methods**:
  - `aggregateDailyPnL(trades: Trade[])` → `PnLPoint[]`

### cumulative
- **File**: `src/services/pnl.ts`
- **Methods**:
  - `cumulative(points: PnLPoint[])` → `PnLPoint[]`

### backtestMetrics
- **File**: `src/services/pnl.ts`
- **Methods**:
  - `backtestMetrics(equityCurve: number[], riskFreeRate: number)` → `BacktestMetrics`

### scoreText
- **File**: `src/services/sentiment.ts`
- **Methods**:
  - `scoreText(text: string)` → `number`

### enrichSentiment
- **File**: `src/services/sentiment.ts`
- **Methods**:
  - `enrichSentiment(item: NewsItem)` → `NewsItem`

### providerBias
- **File**: `src/services/sentiment.ts`
- **Methods**:
  - `providerBias(source: string)` → `number`

### load
- **File**: `src/state/aiSettings.ts`
- **Methods**:
  - `load()` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/state/aiSettings").AISettings`

### save
- **File**: `src/state/aiSettings.ts`
- **Methods**:
  - `save(p: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/state/aiSettings").AISettings)` → `void`

### on
- **File**: `src/state/bus.ts`
- **Methods**:
  - `on(evt: string, fn: Handler<T>)` → `() => boolean`

### emit
- **File**: `src/state/bus.ts`
- **Methods**:
  - `emit(evt: string, data: T)` → `void`

### once
- **File**: `src/state/bus.ts`
- **Methods**:
  - `once(evt: string, fn: Handler<T>)` → `void`

### makeTimeTravelStore
- **File**: `src/state/timeTravel.ts`
- **Methods**:
  - `makeTimeTravelStore(initial: T)` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/zustand/esm/react").UseBoundStore<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/zustand/esm/vanilla").StoreApi<TTState<T>>>`

### AISparkline
- **File**: `src/webc/ai-sparkline.ts`
- **Exported**: ✅
- **Methods**:
  - `attributeChangedCallback()` → `void`
  - `connectedCallback()` → `void`
  - `render()` → `void`

### HistoriquePage
- **File**: `src/app/historique/page.tsx`
- **Methods**:
  - `HistoriquePage({ searchParams }: { searchParams: { symbol?: string | undefined; }; })` → `Promise<React.JSX.Element>`
    > *async function*

### PortfolioPage
- **File**: `src/app/portfolio/page.tsx`
- **Methods**:
  - `PortfolioPage()` → `React.JSX.Element`

### WarriorDemoPage
- **File**: `src/app/warrior-demo/page.tsx`
- **Methods**:
  - `WarriorDemoPage()` → `React.JSX.Element`

### AssistantCoach
- **File**: `src/components/ai/AssistantCoach.tsx`
- **Methods**:
  - `AssistantCoach({ 
  userId, 
  context = 'general', 
  enabled = true 
}: AssistantCoachProps)` → `React.JSX.Element | null`

### FactorsRadar
- **File**: `src/components/charts/FactorsRadar.tsx`
- **Methods**:
  - `FactorsRadar({ f }: { f: Factors; })` → `React.JSX.Element`

### PnLCumulated
- **File**: `src/components/charts/PnLCumulated.tsx`
- **Methods**:
  - `PnLCumulated({ data }: { data: PnLPoint[]; })` → `React.JSX.Element`

### CursorSystem
- **File**: `src/components/cursor/CursorSystem.tsx`
- **Methods**:
  - `CursorSystem()` → `React.JSX.Element`

### showTooltip
- **File**: `src/components/cursor/CursorSystem.tsx`
- **Methods**:
  - `showTooltip(text: string, x: number, y: number)` → `void`

### hideTooltip
- **File**: `src/components/cursor/CursorSystem.tsx`
- **Methods**:
  - `hideTooltip()` → `void`

### WatchlistDnD
- **File**: `src/components/dnd/WatchlistDnD.tsx`
- **Methods**:
  - `WatchlistDnD({ 
  symbols: initial = ['SPY', 'QQQ', 'TLT', 'GLD'] 
}: { symbols?: string[] | undefined; })` → `React.JSX.Element`

### AchievementSystem
- **File**: `src/components/gamification/AchievementSystem.tsx`
- **Methods**:
  - `AchievementSystem()` → `React.JSX.Element`

### Leaderboard
- **File**: `src/components/gamification/Leaderboard.tsx`
- **Methods**:
  - `Leaderboard({ type, timeframe }: LeaderboardProps)` → `React.JSX.Element`

### APITester
- **File**: `src/components/middleware/APITester.tsx`
- **Methods**:
  - `APITester()` → `React.JSX.Element`

### ConfigPanel
- **File**: `src/components/middleware/ConfigPanel.tsx`
- **Methods**:
  - `ConfigPanel()` → `React.JSX.Element`

### ErrorBoundary
- **File**: `src/components/middleware/ErrorBoundary.tsx`
- **Exported**: ✅
- **Methods**:
  - `getDerivedStateFromError(error: Error)` → `State`
  - `componentDidCatch(error: Error, errorInfo: React.ErrorInfo)` → `void`
  - `render()` → `string | number | bigint | boolean | React.JSX.Element | Iterable<React.ReactNode> | Promise<AwaitedReactNode> | null | undefined`

### LoadingSpinner
- **File**: `src/components/middleware/LoadingSpinner.tsx`
- **Methods**:
  - `LoadingSpinner({ size = 'md', text, className = '' }: Props)` → `React.JSX.Element`

### PerformanceMetrics
- **File**: `src/components/middleware/PerformanceMetrics.tsx`
- **Methods**:
  - `PerformanceMetrics()` → `React.JSX.Element`

### QueueMonitor
- **File**: `src/components/middleware/QueueMonitor.tsx`
- **Methods**:
  - `QueueMonitor()` → `React.JSX.Element`

### StatusDashboard
- **File**: `src/components/middleware/StatusDashboard.tsx`
- **Methods**:
  - `StatusDashboard()` → `React.JSX.Element`

### SystemSummary
- **File**: `src/components/middleware/SystemSummary.tsx`
- **Methods**:
  - `SystemSummary()` → `React.JSX.Element`

### Breadcrumbs
- **File**: `src/components/nav/Breadcrumbs.tsx`
- **Methods**:
  - `Breadcrumbs()` → `React.JSX.Element | null`

### humanize
- **File**: `src/components/nav/Breadcrumbs.tsx`
- **Methods**:
  - `humanize(s: string)` → `string`

### MobileDrawer
- **File**: `src/components/nav/MobileDrawer.tsx`
- **Methods**:
  - `MobileDrawer({ open, onClose }: MobileDrawerProps)` → `React.JSX.Element | null`

### ModeSwitcher
- **File**: `src/components/nav/ModeSwitcher.tsx`
- **Methods**:
  - `ModeSwitcher()` → `React.JSX.Element`

### Navbar
- **File**: `src/components/nav/Navbar.tsx`
- **Methods**:
  - `Navbar({ onOpenMobile }: { onOpenMobile: () => void; })` → `React.JSX.Element`

### UserMenu
- **File**: `src/components/nav/Navbar.tsx`
- **Methods**:
  - `UserMenu()` → `React.JSX.Element`

### RouteMemory
- **File**: `src/components/nav/RouteMemory.tsx`
- **Methods**:
  - `RouteMemory()` → `null`

### Sidebar
- **File**: `src/components/nav/Sidebar.tsx`
- **Methods**:
  - `Sidebar()` → `React.JSX.Element`

### SidebarLinks
- **File**: `src/components/nav/SidebarLinks.tsx`
- **Methods**:
  - `SidebarLinks({ item }: SidebarLinksProps)` → `React.JSX.Element`

### isModePath
- **File**: `src/components/nav/route-helpers.ts`
- **Methods**:
  - `isModePath(pathname: string)` → `boolean`

### currentMode
- **File**: `src/components/nav/route-helpers.ts`
- **Methods**:
  - `currentMode(pathname: string)` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/components/nav/nav.config").AppMode | null`

### withMode
- **File**: `src/components/nav/route-helpers.ts`
- **Methods**:
  - `withMode(mode: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/components/nav/nav.config").AppMode, subpath: string)` → `string`

### activeMatch
- **File**: `src/components/nav/route-helpers.ts`
- **Methods**:
  - `activeMatch(current: string, href: string)` → `boolean`

### WebVitalsDashboard
- **File**: `src/components/performance/WebVitalsDashboard.tsx`
- **Methods**:
  - `WebVitalsDashboard()` → `React.JSX.Element`

### AnimatedSearchBar
- **File**: `src/components/search/AnimatedSearchBar.tsx`
- **Methods**:
  - `AnimatedSearchBar({ onResults, onQueryChange }: AnimatedSearchBarProps)` → `React.JSX.Element`

### AnimatedTickerCard
- **File**: `src/components/search/AnimatedTickerCard.tsx`
- **Methods**:
  - `AnimatedTickerCard({ 
  item, 
  onAddWatch, 
  onCompare, 
  onAlert, 
  index = 0 
}: AnimatedTickerCardProps)` → `React.JSX.Element`

### SearchBar
- **File**: `src/components/search/SearchBar.tsx`
- **Methods**:
  - `SearchBar({ onResults, onQueryChange }: { onResults: (items: any[]) => void; onQueryChange?: ((query: string) => void) | undefined; })` → `React.JSX.Element`

### SearchFilters
- **File**: `src/components/search/SearchFilters.tsx`
- **Methods**:
  - `SearchFilters({ onFiltersChange, isOpen, onToggle }: Props)` → `React.JSX.Element`

### SearchHistory
- **File**: `src/components/search/SearchHistory.tsx`
- **Methods**:
  - `SearchHistory({ onSelect }: { onSelect: (query: string) => void; })` → `React.JSX.Element | null`

### SearchResultsSummary
- **File**: `src/components/search/SearchResultsSummary.tsx`
- **Methods**:
  - `SearchResultsSummary({ query, results, loading, filters }: Props)` → `React.JSX.Element | null`

### TickerCard
- **File**: `src/components/search/TickerCard.tsx`
- **Methods**:
  - `TickerCard({ item, onAddWatch, onCompare, onAlert }: Props)` → `React.JSX.Element`

### MaterialButton
- **File**: `src/components/ui/MaterialButton.tsx`
- **Methods**:
  - `MaterialButton({ 
  children, 
  ripple = true, 
  animated = true,
  ...props 
}: MaterialButtonProps)` → `React.JSX.Element`

### PriceDepth
- **File**: `src/design-system/three/PriceDepth.tsx`
- **Methods**:
  - `PriceDepth({ points }: { points: number[]; })` → `React.JSX.Element`

### runBacktest
- **File**: `src/features/backtesting/index.ts`
- **Methods**:
  - `runBacktest(input: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/backtesting/index").BacktestInput)` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/backtesting/index").BacktestOutput`

### runScreener
- **File**: `src/features/screener/index.ts`
- **Methods**:
  - `runScreener(q: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/screener/index").ScreenerQuery)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/screener/index").ScreenerRow[]>`
    > *async function*

### AnalyticsService
- **File**: `src/lib/analytics/Analytics.ts`
- **Methods**:
  - `track(event: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").AnalyticsEvent)` → `void`
  - `startFlushTimer()` → `void`
  - `flush()` → `Promise<void>`
    > *async function*
  - `forceFlush()` → `Promise<void>`
    > *async function*
  - `getEventCount()` → `number`
  - `destroy()` → `void`

### CommandRegistry
- **File**: `src/lib/commands/registry.ts`
- **Methods**:
  - `add(cmd: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/commands/registry").Command)` → `void`
  - `remove(id: string)` → `void`
  - `list()` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/commands/registry").Command[]`
  - `clear()` → `void`

### ErrorBoundary
- **File**: `src/lib/errors/ErrorBoundary.tsx`
- **Exported**: ✅
- **Methods**:
  - `getDerivedStateFromError()` → `{ hasError: boolean; }`
  - `componentDidCatch(error: any)` → `void`
  - `render()` → `string | number | bigint | boolean | React.JSX.Element | Iterable<React.ReactNode> | Promise<AwaitedReactNode> | null | undefined`

### ClickHandlerService
- **File**: `src/lib/handlers/ClickHandlerService.ts`
- **Methods**:
  - `post(url: string, body: unknown, headers: Record<string, string>)` → `Promise<T>`
    > *async function*
  - `handleOrderClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").OrderClickData)` → `Promise<boolean>`
    > *async function*
  - `handleQuickBuy(symbol: string, mode: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").TradingMode)` → `Promise<boolean>`
    > *async function*
  - `handleQuickSell(symbol: string, mode: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").TradingMode)` → `Promise<boolean>`
    > *async function*
  - `handlePositionClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").PositionClickData)` → `Promise<boolean>`
    > *async function*
  - `handleNotificationClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").NotificationClickData)` → `Promise<boolean>`
    > *async function*
  - `handleChartClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").ChartClickData)` → `Promise<boolean>`
    > *async function*
  - `handleNavigationClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").NavigationClickData)` → `Promise<boolean>`
    > *async function*

### ClickHandlerService
- **File**: `src/lib/handlers/clickHandlers.ts`
- **Exported**: ✅
- **Methods**:
  - `getInstance()` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").ClickHandlerService`
  - `handleOrderClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").OrderClickData)` → `Promise<boolean>`
    > *async function*
  - `handlePositionClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").PositionClickData)` → `Promise<boolean>`
    > *async function*
  - `handleNotificationClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").NotificationClickData)` → `Promise<boolean>`
    > *async function*
  - `handleChartClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").ChartClickData)` → `Promise<boolean>`
    > *async function*
  - `handleNavigationClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").NavigationClickData)` → `Promise<boolean>`
    > *async function*
  - `handleQuickBuy(symbol: string, mode: "paper" | "live")` → `Promise<boolean>`
    > *async function*
  - `handleQuickSell(symbol: string, mode: "paper" | "live")` → `Promise<boolean>`
    > *async function*
  - `validateOrderData(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").OrderClickData)` → `boolean`
  - `showLiveTradingConfirmation(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").OrderClickData)` → `Promise<boolean>`
    > *async function*
  - `placeOrder(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").OrderClickData)` → `Promise<{ success: boolean; error?: string | undefined; }>`
    > *async function*
  - `closePosition(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").PositionClickData)` → `Promise<boolean>`
    > *async function*
  - `modifyPosition(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").PositionClickData)` → `Promise<boolean>`
    > *async function*
  - `viewPositionDetails(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").PositionClickData)` → `Promise<boolean>`
    > *async function*
  - `markNotificationRead(notificationId: string)` → `Promise<boolean>`
    > *async function*
  - `dismissNotification(notificationId: string)` → `Promise<boolean>`
    > *async function*
  - `viewNotificationDetails(notificationId: string)` → `Promise<boolean>`
    > *async function*
  - `handlePricePointClick(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").ChartClickData)` → `Promise<boolean>`
    > *async function*
  - `handleChartNavigation(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").ChartClickData)` → `Promise<boolean>`
    > *async function*
  - `trackClick(action: string)` → `void`
  - `trackOrderSuccess(data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").OrderClickData)` → `void`
  - `getClickAnalytics()` → `Map<string, number>`
  - `getOrderHistory()` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").OrderClickData[]`
  - `clearAnalytics()` → `void`

### PrefetchManager
- **File**: `src/lib/performance/prefetch.ts`
- **Methods**:
  - `setupVisibilityChange()` → `void`
  - `pausePrefetching()` → `void`
  - `resumePrefetching()` → `void`
  - `prefetch(url: string, type: "script" | "style" | "image" | "fetch", options: PrefetchOptions)` → `void`
  - `executePrefetch(item: PrefetchItem)` → `Promise<void>`
    > *async function*
  - `prefetchScript(url: string)` → `Promise<void>`
  - `prefetchStyle(url: string)` → `Promise<void>`
  - `prefetchImage(url: string)` → `Promise<void>`
  - `prefetchFetch(url: string)` → `Promise<void>`
    > *async function*
  - `observeElement(selector: string, callback: (element: Element) => void)` → `void`
  - `prefetchOnHover(element: HTMLElement, urls: string[], type: "script" | "style" | "image" | "fetch")` → `void`
  - `prefetchRoute(route: string)` → `void`
  - `getStats()` → `{ total: number; loaded: number; pending: number; highPriority: number; loadRate: number; }`
  - `clear()` → `void`

### WebVitalsMonitor
- **File**: `src/lib/performance/web-vitals.ts`
- **Methods**:
  - `getRating(name: string, value: number)` → `"good" | "needs-improvement" | "poor"`
  - `reportMetric(metric: any)` → `Promise<void>`
    > *async function*
  - `start()` → `void`
  - `stop()` → `void`
  - `getMetrics()` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/performance/web-vitals").WebVitalsMetric[]`
  - `getLatestMetric(name: string)` → `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/performance/web-vitals").WebVitalsMetric | undefined`
  - `getAverageMetric(name: string)` → `number`
  - `getScore()` → `{ overall: number; breakdown: Record<string, number>; }`

### SymbolPage
- **File**: `src/app/symbol/[ticker]/page.tsx`
- **Methods**:
  - `SymbolPage({ params }: { params: { ticker: string; }; })` → `Promise<React.JSX.Element>`
    > *async function*

### SystemHealthPage
- **File**: `src/app/system/health/page.tsx`
- **Methods**:
  - `SystemHealthPage()` → `React.JSX.Element`

### Card
- **File**: `src/app/system/health/page.tsx`
- **Methods**:
  - `Card({ label, value }: { label: string; value: any; })` → `React.JSX.Element`

### RootLayout
- **File**: `app/layout.tsx`
- **Methods**:
  - `RootLayout({
  children,
}: { children: React.ReactNode; })` → `React.JSX.Element`

### HomePage
- **File**: `app/page.tsx`
- **Methods**:
  - `HomePage()` → `React.JSX.Element`

### ErrorBoundary
- **File**: `app/providers.tsx`
- **Methods**:
  - `ErrorBoundary({ children }: { children?: React.ReactNode; })` → `React.JSX.Element`

### ErrorCatcher
- **File**: `app/providers.tsx`
- **Methods**:
  - `ErrorCatcher({ children, onError }: { children?: React.ReactNode; } & { onError: (e: Error) => void; })` → `React.JSX.Element`

### PerformanceMonitor
- **File**: `app/providers.tsx`
- **Methods**:
  - `PerformanceMonitor()` → `null`

### Providers
- **File**: `app/providers.tsx`
- **Methods**:
  - `Providers({ children }: { children?: React.ReactNode; })` → `React.JSX.Element`

### ModeLayout
- **File**: `app/[mode]/layout.tsx`
- **Methods**:
  - `ModeLayout({ children, params }: ModeLayoutProps)` → `React.JSX.Element`

### ModeNotFound
- **File**: `app/[mode]/not-found.tsx`
- **Methods**:
  - `ModeNotFound({ params }: NotFoundProps)` → `React.JSX.Element`

### AnimationsDemo
- **File**: `app/animations-demo/page.tsx`
- **Methods**:
  - `AnimationsDemo()` → `React.JSX.Element`

### Page
- **File**: `app/click-demo/page.tsx`
- **Methods**:
  - `Page()` → `React.JSX.Element`

### ComparePage
- **File**: `app/compare/page.tsx`
- **Methods**:
  - `ComparePage({ searchParams }: { searchParams: { symbols?: string | undefined; }; })` → `React.JSX.Element`

### GlassButton
- **File**: `app/components/GlassButton.tsx`
- **Methods**:
  - `GlassButton({ 
  variant = "primary", 
  size = "md",
  children, 
  className = "",
  onClick
}: Props)` → `React.JSX.Element`

### InstrumentScreener
- **File**: `app/components/InstrumentScreener.tsx`
- **Methods**:
  - `InstrumentScreener({ 
  instruments, 
  onInstrumentSelect,
  onAddToWatchlist,
  className = "" 
}: InstrumentScreenerProps)` → `React.JSX.Element`

### WhyInvest
- **File**: `app/components/WhyInvest.tsx`
- **Methods**:
  - `WhyInvest({ instrument, className = "" }: WhyInvestProps)` → `React.JSX.Element`

### Dashboard
- **File**: `app/dashboard/page.tsx`
- **Methods**:
  - `Dashboard()` → `React.JSX.Element`

### AISignalsPanel
- **File**: `app/dashboard/page.tsx`
- **Methods**:
  - `AISignalsPanel({ signals }: { signals: any[]; })` → `React.JSX.Element`

### History
- **File**: `app/history/page.tsx`
- **Methods**:
  - `History()` → `React.JSX.Element`

### UserDashboard
- **File**: `app/my-dashboard/page.tsx`
- **Methods**:
  - `UserDashboard()` → `React.JSX.Element`

### OverviewView
- **File**: `app/my-dashboard/page.tsx`
- **Methods**:
  - `OverviewView({ metrics, watchlist, recentActivity }: { metrics: UserMetrics | null; watchlist: any[]; recentActivity: any[]; })` → `React.JSX.Element | null`

### PerformanceView
- **File**: `app/my-dashboard/page.tsx`
- **Methods**:
  - `PerformanceView({ metrics }: { metrics: UserMetrics | null; })` → `React.JSX.Element | null`

### GoalsView
- **File**: `app/my-dashboard/page.tsx`
- **Methods**:
  - `GoalsView({ goals, onUpdateGoals }: { goals: CustomGoal[]; onUpdateGoals: (goals: CustomGoal[]) => void; })` → `React.JSX.Element`

### CustomizeView
- **File**: `app/my-dashboard/page.tsx`
- **Methods**:
  - `CustomizeView()` → `React.JSX.Element`

### Pentagon
- **File**: `app/pentagon/page.tsx`
- **Methods**:
  - `Pentagon()` → `React.JSX.Element`

### Performance
- **File**: `app/performance/page.tsx`
- **Methods**:
  - `Performance()` → `React.JSX.Element`

### Portfolio
- **File**: `app/portfolio/page.tsx`
- **Methods**:
  - `Portfolio()` → `React.JSX.Element`

### Screener
- **File**: `app/screener/page.tsx`
- **Methods**:
  - `Screener()` → `React.JSX.Element`

### SearchPage
- **File**: `app/search/page.tsx`
- **Methods**:
  - `SearchPage()` → `React.JSX.Element`

### AnimatedSearchPage
- **File**: `app/search-animated/page.tsx`
- **Methods**:
  - `AnimatedSearchPage()` → `React.JSX.Element`

### TradingPage
- **File**: `app/trading/page.tsx`
- **Methods**:
  - `TradingPage()` → `React.JSX.Element`

### DSPage
- **File**: `app/(ds)/ds/page.tsx`
- **Methods**:
  - `DSPage()` → `React.JSX.Element`

### PortfolioDetail
- **File**: `app/(trading)/components/PortfolioDetail.tsx`
- **Methods**:
  - `PortfolioDetail({ mode }: PortfolioDetailProps)` → `React.JSX.Element`

### TradingDashboard
- **File**: `app/(trading)/components/TradingDashboard.tsx`
- **Methods**:
  - `TradingDashboard({ mode }: TradingDashboardProps)` → `React.JSX.Element`

### JournalModePage
- **File**: `app/[mode]/journal/page.tsx`
- **Methods**:
  - `JournalModePage({ params }: JournalModePageProps)` → `React.JSX.Element`

### OverviewModePage
- **File**: `app/[mode]/overview/page.tsx`
- **Methods**:
  - `OverviewModePage({ params }: OverviewModePageProps)` → `React.JSX.Element`

### generateMetadata
- **File**: `app/[mode]/overview/page.tsx`
- **Methods**:
  - `generateMetadata({ params }: OverviewModePageProps)` → `Promise<{ title: string; description: string; }>`
    > *async function*

### PortfolioModePage
- **File**: `app/[mode]/portfolio/page.tsx`
- **Methods**:
  - `PortfolioModePage({ params }: PortfolioModePageProps)` → `React.JSX.Element`

### SettingsModePage
- **File**: `app/[mode]/settings/page.tsx`
- **Methods**:
  - `SettingsModePage({ params }: SettingsModePageProps)` → `React.JSX.Element`

### TradingModePage
- **File**: `app/[mode]/trading/page.tsx`
- **Methods**:
  - `TradingModePage({ params }: TradingModePageProps)` → `React.JSX.Element`

### AdvisorDashboard
- **File**: `app/advisor/dashboard/page.tsx`
- **Methods**:
  - `AdvisorDashboard()` → `React.JSX.Element`

### setParams
- **File**: `app/advisor/dashboard/page.tsx`
- **Methods**:
  - `setParams(p: Props)` → `void`

### listAssets
- **File**: `app/ai/suggestions/page.tsx`
- **Methods**:
  - `listAssets(limit: number)` → `Promise<Item[]>`
    > *async function*

### fetchJSON
- **File**: `app/ai/suggestions/page.tsx`
- **Methods**:
  - `fetchJSON(url: string, maxRetries: number)` → `Promise<any>`
    > *async function*

### chunk
- **File**: `app/ai/suggestions/page.tsx`
- **Methods**:
  - `chunk(arr: T[], n: number)` → `T[][]`

### fetchBarsMany
- **File**: `app/ai/suggestions/page.tsx`
- **Methods**:
  - `fetchBarsMany(symbols: string[], timeframe: string, limit: number, chunkSize: number, retries: number)` → `Promise<Record<string, Bar[]>>`
    > *async function*

### clamp01
- **File**: `app/ai/suggestions/page.tsx`
- **Methods**:
  - `clamp01(x: number)` → `number`

### scoreHeuristic
- **File**: `app/ai/suggestions/page.tsx`
- **Methods**:
  - `scoreHeuristic(bars: Bar[], w: { wDonchian: number; wMomentum: number; wRSI: number; })` → `{ ok: false; score: number; comp: { d: number; m: number; r: number; }; rsi: number; momentum: number; breakout: boolean; } | { ok: true; score: number; comp: { d: number; m: number; r: number; }; rsi: number; momentum: number; breakout: boolean; }`

### AISuggestionsPage
- **File**: `app/ai/suggestions/page.tsx`
- **Methods**:
  - `AISuggestionsPage()` → `React.JSX.Element`

### PersonalAlerts
- **File**: `app/alerts/personal/page.tsx`
- **Methods**:
  - `PersonalAlerts()` → `React.JSX.Element`

### label
- **File**: `app/alerts/personal/page.tsx`
- **Methods**:
  - `label(r: Rule)` → `string`

### GET
- **File**: `app/api/account/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<any>>`
    > *async function*

### GET
- **File**: `app/api/alpaca/route.ts`
- **Methods**:
  - `GET()` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/analytics/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ ok: boolean; processed: number; }>>`
    > *async function*

### GET
- **File**: `app/api/calendar/route.ts`
- **Methods**:
  - `GET(req: Request)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ items: { events: never[]; }; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### GET
- **File**: `app/api/discover/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<({ id: string; type: "stock"; title: string; description: string; symbol: string; price: number; change: number; changePercent: number; sentiment: number; tags: string[]; timestamp: string; } | { id: string; type: "crypto"; title: string; description: string; symbol: string; price: number; change: number; changePercent: number; sentiment: number; tags: string[]; timestamp: string; } | { id: string; type: "news"; title: string; description: string; sentiment: number; tags: string[]; timestamp: string; symbol?: undefined; price?: undefined; change?: undefined; changePercent?: undefined; } | { id: string; type: "alert"; title: string; description: string; symbol: string; price: number; change: number; changePercent: number; sentiment: number; tags: string[]; timestamp: string; } | { id: string; type: "etf"; title: string; description: string; symbol: string; price: number; change: number; changePercent: number; sentiment: number; tags: string[]; timestamp: string; })[]> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### calculateFactors
- **File**: `app/api/factors/route.ts`
- **Methods**:
  - `calculateFactors(symbol: string)` → `{ symbol: string; momentum: number; value: number; quality: number; risk: number; growth: number; asOf: string; }`

### GET
- **File**: `app/api/factors/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ symbol: string; momentum: number; value: number; quality: number; risk: number; growth: number; asOf: string; }[]> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### GET
- **File**: `app/api/health/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/journal/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; data: { trades: any; pagination: { total: any; limit: number; offset: number; hasMore: boolean; }; }; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; error: string; }>>`
    > *async function*

### POST
- **File**: `app/api/journal/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; data: any; }>>`
    > *async function*

### GET
- **File**: `app/api/news/route.ts`
- **Methods**:
  - `GET(req: Request)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ items: { headlines: never[]; }; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### GET
- **File**: `app/api/orders/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ id: any; symbol: any; side: any; qty: number; price: number; status: any; type: any; createdAt: any; filledAt: any; submittedAt: any; updatedAt: any; }[]>>`
    > *async function*

### POST
- **File**: `app/api/orders/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ id: any; symbol: any; side: any; qty: number; price: number; status: any; type: any; createdAt: any; filledAt: any; submittedAt: any; updatedAt: any; }>>`
    > *async function*

### GET
- **File**: `app/api/overview/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ mode: string; portfolio: { totalValue: number; dayPnl: number; dayPnlPct: number; positions: number; cash: number; }; recentTrades: { id: string; symbol: string; side: string; qty: number; price: number; timestamp: Date; }[]; timestamp: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### GET
- **File**: `app/api/performance/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ date: string; equity: number; returns: number; drawdown: number; benchmark: number; }[]> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### GET
- **File**: `app/api/portfolio/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ portfolioData: any[]; currentPositions: { id: string; symbol: string; side: any; quantity: any; avgPrice: number; marketValue: any; unrealizedPL: any; unrealizedPLPercent: any; }[]; performanceMetrics: { totalTrades: any; winningTrades: any; winRate: number; totalReturn: number; totalReturnPercent: number; totalInvestment: number; }; timeframe: string; mode: string; }>>`
    > *async function*

### POST
- **File**: `app/api/portfolio/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; count: any; }>>`
    > *async function*

### groupSnapshotsByDate
- **File**: `app/api/portfolio/route.ts`
- **Methods**:
  - `groupSnapshotsByDate(snapshots: any[])` → `any[]`

### getCurrentPositions
- **File**: `app/api/portfolio/route.ts`
- **Methods**:
  - `getCurrentPositions(userId: string, mode: string)` → `Promise<{ id: string; symbol: string; side: any; quantity: any; avgPrice: number; marketValue: any; unrealizedPL: any; unrealizedPLPercent: any; }[]>`
    > *async function*

### getPerformanceMetrics
- **File**: `app/api/portfolio/route.ts`
- **Methods**:
  - `getPerformanceMetrics(userId: string, mode: string, startDate: Date)` → `Promise<{ totalTrades: any; winningTrades: any; winRate: number; totalReturn: number; totalReturnPercent: number; totalInvestment: number; }>`
    > *async function*

### GET
- **File**: `app/api/positions/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<any>>`
    > *async function*

### GET
- **File**: `app/api/search/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/signals/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ signals: any; total: any; }>>`
    > *async function*

### POST
- **File**: `app/api/signals/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; results: ({ instrument: any; signal: { id: any; type: any; strength: any; confidence: any; riskLevel: any; }; error?: undefined; } | { instrument: any; error: string; signal?: undefined; })[]; totalGenerated: number; totalErrors: number; }>>`
    > *async function*

### PUT
- **File**: `app/api/signals/route.ts`
- **Methods**:
  - `PUT(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; signal: { id: any; symbol: any; name: any; signalType: any; strength: any; confidence: any; isActive: any; triggeredAt: any; closedAt: any; actualReturn: any; actualReturnPercent: any; updatedAt: any; }; }>>`
    > *async function*

### DELETE
- **File**: `app/api/signals/route.ts`
- **Methods**:
  - `DELETE(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; message: string; }>>`
    > *async function*

### GET
- **File**: `app/api/test-env/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ hasKeyId: boolean; hasSecret: boolean; keyIdLength: number; secretLength: number; keyIdPrefix: string; secretPrefix: string; paperBase: string | undefined; allEnvVars: { APCA_API_KEY_ID: string; APCA_API_SECRET_KEY: string; APCA_PAPER_BASE_URL: string; }; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### GET
- **File**: `app/api/trades/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<any>>`
    > *async function*

### POST
- **File**: `app/api/trades/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ symbol: string; id: string; side: string; qty: number; price: number; filledAt: Date; strategyTag: string | null; pnl: number | null; createdAt: Date; }>>`
    > *async function*

### GET
- **File**: `app/api/watchlist/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; error: string; details: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").WatchlistResponse>>`
    > *async function*

### POST
- **File**: `app/api/watchlist/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").WatchlistResponse> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; error: string; details: string; }> | undefined>`
    > *async function*

### TradingDashboard
- **File**: `app/dashboard/trading/page.tsx`
- **Methods**:
  - `TradingDashboard()` → `React.JSX.Element`

### FilterPanel
- **File**: `app/dashboard/trading/page.tsx`
- **Methods**:
  - `FilterPanel({ timeframe, onChangeTF }: { timeframe: string; onChangeTF: (tf: any) => void; })` → `React.JSX.Element`

### TradeButtons
- **File**: `app/dashboard/trading/page.tsx`
- **Methods**:
  - `TradeButtons({ symbol }: { symbol: string; })` → `React.JSX.Element`

### DiscoverPage
- **File**: `app/paper/discover/page.tsx`
- **Methods**:
  - `DiscoverPage()` → `React.JSX.Element`

### SymbolPage
- **File**: `app/symbol/[id]/page.tsx`
- **Methods**:
  - `SymbolPage({ params }: { params: { id: string; }; })` → `React.JSX.Element`

### SystemHealthPage
- **File**: `app/system/health/page.tsx`
- **Methods**:
  - `SystemHealthPage()` → `React.JSX.Element`

### TradingDashboard
- **File**: `app/trading/components/TradingDashboard.tsx`
- **Methods**:
  - `TradingDashboard()` → `React.JSX.Element`

### OnboardingPage
- **File**: `app/trading/onboarding/page.tsx`
- **Methods**:
  - `OnboardingPage()` → `React.JSX.Element`

### AISystemsLab
- **File**: `app/(lab)/lab/ai-systems/page.tsx`
- **Methods**:
  - `AISystemsLab()` → `React.JSX.Element`

### MiddlewareLab
- **File**: `app/(lab)/lab/middleware/page.tsx`
- **Methods**:
  - `MiddlewareLab()` → `React.JSX.Element`

### PerformanceLab
- **File**: `app/(lab)/lab/performance/page.tsx`
- **Methods**:
  - `PerformanceLab()` → `React.JSX.Element`

### ROIOverview
- **File**: `app/(lab)/lab/roi-overview/page.tsx`
- **Methods**:
  - `ROIOverview()` → `React.JSX.Element`

### UXCursorLab
- **File**: `app/(lab)/lab/ux-cursor/page.tsx`
- **Methods**:
  - `UXCursorLab()` → `React.JSX.Element`

### EquityChart
- **File**: `app/(trading)/components/Overview/EquityChart.tsx`
- **Methods**:
  - `EquityChart({ data }: EquityChartProps)` → `React.JSX.Element`

### KPICard
- **File**: `app/(trading)/components/Overview/KPICard.tsx`
- **Methods**:
  - `KPICard({ title, value, format, trend, showTrend }: KPICardProps)` → `React.JSX.Element`

### NotificationTray
- **File**: `app/(trading)/components/Overview/NotificationTray.tsx`
- **Methods**:
  - `NotificationTray({ notifications, mode }: NotificationTrayProps)` → `React.JSX.Element`

### OrdersTable
- **File**: `app/(trading)/components/Overview/OrdersTable.tsx`
- **Methods**:
  - `OrdersTable({ orders, mode, onOrderClick }: OrdersTableProps)` → `React.JSX.Element`

### OverviewHeader
- **File**: `app/(trading)/components/Overview/OverviewHeader.tsx`
- **Methods**:
  - `OverviewHeader({ mode, asOf, isConnected, lastUpdate }: OverviewHeaderProps)` → `React.JSX.Element`

### OverviewPage
- **File**: `app/(trading)/components/Overview/OverviewPage.tsx`
- **Methods**:
  - `OverviewPage({ mode }: OverviewPageProps)` → `React.JSX.Element`

### OverviewSkeleton
- **File**: `app/(trading)/components/Overview/OverviewPage.tsx`
- **Methods**:
  - `OverviewSkeleton()` → `React.JSX.Element`

### PnLCard
- **File**: `app/(trading)/components/Overview/PnLCard.tsx`
- **Methods**:
  - `PnLCard({ dayPnL }: PnLCardProps)` → `React.JSX.Element`

### PositionsTable
- **File**: `app/(trading)/components/Overview/PositionsTable.tsx`
- **Methods**:
  - `PositionsTable({ positions, mode }: PositionsTableProps)` → `React.JSX.Element`

### SearchBar
- **File**: `app/(trading)/components/Overview/SearchBar.tsx`
- **Methods**:
  - `SearchBar()` → `React.JSX.Element`

### Watchlist
- **File**: `app/(trading)/components/Overview/Watchlist.tsx`
- **Methods**:
  - `Watchlist({ items, mode }: WatchlistProps)` → `React.JSX.Element`

### fetchBarsMany
- **File**: `app/api/ai/advice/route.ts`
- **Methods**:
  - `fetchBarsMany(symbols: string[], timeframe: string, limit: number)` → `Promise<Record<string, Bar[]>>`
    > *async function*

### scoreHeuristic
- **File**: `app/api/ai/advice/route.ts`
- **Methods**:
  - `scoreHeuristic(bars: Bar[])` → `{ ok: false; score: number; comp: { d: number; m: number; r: number; }; rsi: number; momentum: number; breakout: boolean; } | { ok: true; score: number; comp: { d: number; m: number; r: number; }; rsi: number; momentum: number; breakout: boolean; }`

### POST
- **File**: `app/api/ai/advice/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/ai/agents/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/ai/agents/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/ai/feedback/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/ai/genetic-algorithm/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/ai/genetic-algorithm/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/ai/hybrid/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/ai/hybrid/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/ai/meta-learning/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/ai/meta-learning/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/ai/monitoring/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/ai/monitoring/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/ai/predict/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; data: { symbol: any; decision: any; dailyVol: number; backtest: any; timestamp: string; }; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; error: string; }>>`
    > *async function*

### donchian
- **File**: `app/api/alerts/eval/route.ts`
- **Methods**:
  - `donchian(symbol: string, lookback: number)` → `Promise<"breakout_up" | "breakout_down" | "neutral">`
    > *async function*

### stdev
- **File**: `app/api/alerts/eval/route.ts`
- **Methods**:
  - `stdev(arr: number[])` → `number`

### volatilitySpike
- **File**: `app/api/alerts/eval/route.ts`
- **Methods**:
  - `volatilitySpike(symbol: string, thr: number)` → `Promise<boolean>`
    > *async function*

### POST
- **File**: `app/api/alerts/eval/route.ts`
- **Methods**:
  - `POST()` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ ok: boolean; fired: any[]; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### listActiveAssetsCached
- **File**: `app/api/alpaca/assets/route.ts`
- **Methods**:
  - `listActiveAssetsCached()` → `Promise<Asset[]>`
    > *async function*

### GET
- **File**: `app/api/alpaca/assets/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/alpaca/trading/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/alpaca/trading/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/analytics/web-vitals/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/automation/run/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/backtest/start/route.ts`
- **Methods**:
  - `POST(req: Request)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; error: string; details: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; data: { id: string; status: string; message: string; }; }>>`
    > *async function*

### ALL
- **File**: `app/api/gw/[...path]/route.ts`
- **Methods**:
  - `ALL(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest, { params }: { params: { path: string[]; }; })` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/gw/list/route.ts`
- **Methods**:
  - `GET()` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/integrations/aggregate/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/market/backfill/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ ok: boolean; data: { symbol: any; candles: { symbol: any; open: number; high: number; low: number; close: number; volume: number; startTs: number; timeframe: "1m"; }[]; }[]; }>>`
    > *async function*

### POST
- **File**: `app/api/notify/subscribe/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; data: { id: any; }; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; error: string; }>>`
    > *async function*

### POST
- **File**: `app/api/notify/test/route.ts`
- **Methods**:
  - `POST(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; message: string; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ success: boolean; error: string; }>>`
    > *async function*

### GET
- **File**: `app/api/overview/stream/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/performance/metrics/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ totalReturn: number; annualizedReturn: number; sharpeRatio: number; maxDrawdown: number; winRate: number; profitFactor: number; volatility: number; calmarRatio: number; }> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### calculatePerformanceMetrics
- **File**: `app/api/performance/metrics/route.ts`
- **Methods**:
  - `calculatePerformanceMetrics(trades: any[], startDate: Date, endDate: Date)` → `{ totalReturn: number; annualizedReturn: number; sharpeRatio: number; maxDrawdown: number; winRate: number; profitFactor: number; volatility: number; calmarRatio: number; }`

### GET
- **File**: `app/api/pnl/daily/route.ts`
- **Methods**:
  - `GET(request: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ date: string; equity: number; realized: number; unrealized: number; }[]> | import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/response").NextResponse<{ error: string; }>>`
    > *async function*

### GET
- **File**: `app/api/roi/alerts/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/roi/alerts/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/roi/auto-heal/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/roi/auto-heal/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/roi/evaluate/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/roi/evaluation/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/roi/evaluation/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/roi/parallel-sims/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/roi/parallel-sims/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/roi/prospective/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/roi/prospective/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/search/suggest/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/stream/sse/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/user/profile/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/user/profile/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/webhooks/alpaca/route.ts`
- **Methods**:
  - `POST(req: Request)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/ai/agents/[id]/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest, { params }: { params: { id: string; }; })` → `Promise<Response>`
    > *async function*

### PUT
- **File**: `app/api/ai/agents/[id]/route.ts`
- **Methods**:
  - `PUT(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest, { params }: { params: { id: string; }; })` → `Promise<Response>`
    > *async function*

### DELETE
- **File**: `app/api/ai/agents/[id]/route.ts`
- **Methods**:
  - `DELETE(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest, { params }: { params: { id: string; }; })` → `Promise<Response>`
    > *async function*

### POST
- **File**: `app/api/ai/suggestions/log/route.ts`
- **Methods**:
  - `POST(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/alpaca/market/bars/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/alpaca/market/quotes/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

### GET
- **File**: `app/api/alpaca/market/trades/route.ts`
- **Methods**:
  - `GET(req: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/next/dist/server/web/spec-extension/request").NextRequest)` → `Promise<Response>`
    > *async function*

## 🪝 React Hooks


### useCurrentSymbolFromPath
- **File**: `src/components/CommandPalette.tsx`
- **Params**: none
- **Returns**: `string | null`

### useAIAlerts
- **File**: `src/hooks/useAIAlerts.ts`
- **Params**: none
- **Returns**: `{ alerts: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").AIAlert[]; isEvaluating: boolean; evaluateAlert: (symbol: string, currentPrice: number, historicalData: number[]) => Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").AIAlert | null>; clearOldAlerts: () => void; }`
- **Exported**: ✅

### useDynamicRNN
- **File**: `src/hooks/useDynamicRNN.ts`
- **Params**: none
- **Returns**: `{ score: (sequence: number[][]) => number; }`
- **Exported**: ✅

### useOrderHandlers
- **File**: `src/hooks/useOrderHandlers.ts`
- **Params**: none
- **Returns**: `{ submitOrder: (orderData: { symbol: string; type: "market" | "limit" | "stop" | "stop_limit"; side: "buy" | "sell"; qty: number; time_in_force: "day" | "gtc" | "opg" | "ioc" | "fok" | "cls"; limit_price?: number | undefined; stop_price?: number | undefined; client_order_id?: string | undefined; }) => Promise<boolean>; cancelOrder: (orderId: string) => Promise<boolean>; submitMarketOrder: (symbol: string, side: "buy" | "sell", qty: number) => Promise<boolean>; submitLimitOrder: (symbol: string, side: "buy" | "sell", qty: number, limitPrice: number) => Promise<boolean>; isSubmitting: boolean; }`
- **Exported**: ✅

### usePositions
- **File**: `src/hooks/usePositions.ts`
- **Params**: none
- **Returns**: `{ positions: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").Position[]; loading: boolean; error: string | null; refreshPositions: () => Promise<boolean>; portfolioMetrics: { totalValue: number; totalPnL: number; totalPnLPercent: number; positionCount: number; }; }`
- **Exported**: ✅

### useSymbolSearch
- **File**: `src/hooks/useSymbolSearch.ts`
- **Params**: none
- **Returns**: `{ q: string; setQ: React.Dispatch<React.SetStateAction<string>>; results: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/hooks/useSymbolSearch").SymbolItem[]; loading: boolean; selectedIdx: number; setSelectedIdx: React.Dispatch<React.SetStateAction<number>>; favorites: string[]; toggleFavorite: (sym: string) => void; go: (sym: string) => void; }`
- **Exported**: ✅

### useClientFlags
- **File**: `src/lib/flags.ts`
- **Params**: none
- **Returns**: `Record<string, boolean>`
- **Exported**: ✅

### usePreservedQueryLink
- **File**: `src/components/nav/route-helpers.ts`
- **Params**: none
- **Returns**: `(href: string) => string`
- **Exported**: ✅

### useModeLink
- **File**: `src/components/nav/route-helpers.ts`
- **Params**: none
- **Returns**: `(subpath: string) => string`
- **Exported**: ✅

### useCommandPalette
- **File**: `src/components/nav/useCommandPalette.ts`
- **Params**: open: () => void
- **Returns**: `void`
- **Exported**: ✅

### useSystemHealth
- **File**: `src/lib/analytics/useSystemHealth.ts`
- **Params**: none
- **Returns**: `{ ts: number; wsConnected: boolean; wsLatencyMs: number | null; restLatencyMs: number | null; providerErrors1m: number; queueLagMs: number | null; }`
- **Description**: Écoute le bus et calcule un snapshot simple pour la page /system/health
- **Exported**: ✅

### useIndices
- **File**: `src/lib/data/hooks.ts`
- **Params**: universe: string[]
- **Returns**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/@tanstack/react-query/build/modern/types").UseQueryResult<{ symbol: string; price: any; changePct: number; }[], Error>`
- **Exported**: ✅

### useSymbolsSearch
- **File**: `src/lib/data/hooks.ts`
- **Params**: q: string
- **Returns**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/@tanstack/react-query/build/modern/types").UseQueryResult<any, Error>`
- **Exported**: ✅

### useClickHandlers
- **File**: `src/lib/handlers/useClickHandlers.ts`
- **Params**: none
- **Returns**: `{ handleOrderClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").OrderClickData) => Promise<boolean>; handlePositionClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").PositionClickData) => Promise<boolean>; handleNotificationClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").NotificationClickData) => Promise<boolean>; handleChartClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").ChartClickData) => Promise<boolean>; handleNavigationClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").NavigationClickData) => Promise<boolean>; handleQuickBuy: (symbol: string, mode: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").TradingMode) => Promise<boolean>; handleQuickSell: (symbol: string, mode: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").TradingMode) => Promise<boolean>; isLoading: boolean; error: string | undefined; lastAction: React.RefObject<string | undefined>; }`
- **Exported**: ✅

### useOrderHandlers
- **File**: `src/lib/handlers/useClickHandlers.ts`
- **Params**: mode: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").TradingMode
- **Returns**: `{ placeOrder: (symbol: string, side: "buy" | "sell", quantity: number, orderType?: "market" | "limit" | "stop" | "stop_limit", limitPrice?: number | undefined) => Promise<boolean>; quickBuy: (symbol: string) => Promise<boolean>; quickSell: (symbol: string) => Promise<boolean>; isLoading: boolean; error: string | undefined; }`
- **Exported**: ✅

### usePositionHandlers
- **File**: `src/lib/handlers/useClickHandlers.ts`
- **Params**: none
- **Returns**: `{ closePosition: (symbol: string, positionId: string) => Promise<boolean>; modifyPosition: (symbol: string, positionId: string, payload?: Record<string, unknown> | undefined) => Promise<boolean>; viewPositionDetails: (symbol: string, positionId: string) => Promise<boolean>; isLoading: boolean; error: string | undefined; }`
- **Exported**: ✅

### useNotificationHandlers
- **File**: `src/lib/handlers/useClickHandlers.ts`
- **Params**: none
- **Returns**: `{ markAsRead: (notificationId: string) => Promise<boolean>; dismiss: (notificationId: string) => Promise<boolean>; viewDetails: (notificationId: string) => Promise<boolean>; isLoading: boolean; error: string | undefined; }`
- **Exported**: ✅

### useChartHandlers
- **File**: `src/lib/handlers/useClickHandlers.ts`
- **Params**: none
- **Returns**: `{ onPriceClick: (symbol: string, value: number, timestampIso: string) => Promise<boolean>; onTimeframeChange: (symbol: string, timeframe: "1m" | "5m" | "15m" | "1H" | "4H" | "1D" | "1W") => Promise<boolean>; onSymbolChange: (symbol: string, newSymbol: string) => Promise<boolean>; isLoading: boolean; error: string | undefined; }`
- **Exported**: ✅

### useClickHandlers
- **File**: `src/lib/hooks/useClickHandlers.ts`
- **Params**: none
- **Returns**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/hooks/useClickHandlers").UseClickHandlersReturn`
- **Exported**: ✅

### useOrderHandlers
- **File**: `src/lib/hooks/useClickHandlers.ts`
- **Params**: mode: "paper" | "live"
- **Returns**: `{ placeOrder: (symbol: string, side: "buy" | "sell", quantity: number, orderType?: "market" | "limit", limitPrice?: number | undefined) => Promise<boolean>; quickBuy: (symbol: string) => Promise<boolean>; quickSell: (symbol: string) => Promise<boolean>; isLoading: boolean; error: string | null; }`
- **Exported**: ✅

### usePositionHandlers
- **File**: `src/lib/hooks/useClickHandlers.ts`
- **Params**: none
- **Returns**: `{ closePosition: (symbol: string, positionId: string) => Promise<boolean>; modifyPosition: (symbol: string, positionId: string) => Promise<boolean>; viewPositionDetails: (symbol: string, positionId: string) => Promise<boolean>; isLoading: boolean; error: string | null; }`
- **Exported**: ✅

### useNotificationHandlers
- **File**: `src/lib/hooks/useClickHandlers.ts`
- **Params**: none
- **Returns**: `{ markAsRead: (notificationId: string) => Promise<boolean>; dismiss: (notificationId: string) => Promise<boolean>; viewDetails: (notificationId: string) => Promise<boolean>; isLoading: boolean; error: string | null; }`
- **Exported**: ✅

### useChartHandlers
- **File**: `src/lib/hooks/useClickHandlers.ts`
- **Params**: none
- **Returns**: `{ onPriceClick: (symbol: string, price: number, timestamp: string) => Promise<boolean>; onTimeframeChange: (symbol: string, timeframe: string) => Promise<boolean>; onSymbolChange: (symbol: string) => Promise<boolean>; isLoading: boolean; error: string | null; }`
- **Exported**: ✅

### useVoice
- **File**: `src/lib/voice/useVoice.ts`
- **Params**: none
- **Returns**: `{ supported: boolean; listening: boolean; text: string; start: () => void; stop: () => void; setText: React.Dispatch<React.SetStateAction<string>>; }`
- **Exported**: ✅

### useMarketStream
- **File**: `src/lib/ws/useMarketStream.ts`
- **Params**: { symbols, pollFallbackMs=5_000 }: Opts
- **Returns**: `void`
- **Exported**: ✅

### useMoodController
- **File**: `app/providers.tsx`
- **Params**: none
- **Returns**: `{ mood: "happy" | "neutral" | "stressed" | "excited"; setMood: React.Dispatch<React.SetStateAction<"happy" | "neutral" | "stressed" | "excited">>; }`

### useParams
- **File**: `app/advisor/dashboard/page.tsx`
- **Params**: init: Props
- **Returns**: `Props`

### useOverviewSSE
- **File**: `app/(trading)/components/Overview/hooks/useOverviewSSE.ts`
- **Params**: mode: "paper" | "live", onMessage: (data: any) => void
- **Returns**: `UseOverviewSSEReturn`
- **Exported**: ✅

## ⚛️ React Components


### AIAnalysisPanel
- **File**: `src/components/AIAnalysisPanel.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AISidePanel
- **File**: `src/components/AISidePanel.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AdvisorChat
- **File**: `src/components/AdvisorChat.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AnimatedNavLink
- **File**: `src/components/AnimatedNavbar.tsx`
- **Props**: `unknown`

### AnimatedNavbar
- **File**: `src/components/AnimatedNavbar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### CalendarList
- **File**: `src/components/CalendarList.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ChartPanel
- **File**: `src/components/ChartPanel.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ChartTV
- **File**: `src/components/ChartTV.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### CommandPalette
- **File**: `src/components/CommandPalette.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### NavLink
- **File**: `src/components/NavLink.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Navbar
- **File**: `src/components/Navbar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Navigation
- **File**: `src/components/Navigation.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### NewsList
- **File**: `src/components/NewsList.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Projections
- **File**: `src/components/Projections.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Providers
- **File**: `src/components/Providers.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### RightPanelAlerts
- **File**: `src/components/RightPanelAlerts.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SearchSymbol
- **File**: `src/components/SearchSymbol.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### StickyNavbar
- **File**: `src/components/StickyNavbar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ThemeToggle
- **File**: `src/components/ThemeToggle.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ToastRail
- **File**: `src/components/ToastRail.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Card
- **File**: `src/design-system/atoms.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Kpi
- **File**: `src/design-system/atoms.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### MoodBar
- **File**: `src/design-system/atoms.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### HistoriquePage
- **File**: `src/app/historique/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PortfolioPage
- **File**: `src/app/portfolio/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### WarriorDemoPage
- **File**: `src/app/warrior-demo/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AssistantCoach
- **File**: `src/components/ai/AssistantCoach.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### FactorsRadar
- **File**: `src/components/charts/FactorsRadar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PnLCumulated
- **File**: `src/components/charts/PnLCumulated.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### CursorSystem
- **File**: `src/components/cursor/CursorSystem.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### WatchlistDnD
- **File**: `src/components/dnd/WatchlistDnD.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AchievementSystem
- **File**: `src/components/gamification/AchievementSystem.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Leaderboard
- **File**: `src/components/gamification/Leaderboard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### APITester
- **File**: `src/components/middleware/APITester.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ConfigPanel
- **File**: `src/components/middleware/ConfigPanel.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### LoadingSpinner
- **File**: `src/components/middleware/LoadingSpinner.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PerformanceMetrics
- **File**: `src/components/middleware/PerformanceMetrics.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### QueueMonitor
- **File**: `src/components/middleware/QueueMonitor.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### StatusDashboard
- **File**: `src/components/middleware/StatusDashboard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SystemSummary
- **File**: `src/components/middleware/SystemSummary.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Breadcrumbs
- **File**: `src/components/nav/Breadcrumbs.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### MobileDrawer
- **File**: `src/components/nav/MobileDrawer.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ModeSwitcher
- **File**: `src/components/nav/ModeSwitcher.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Navbar
- **File**: `src/components/nav/Navbar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### UserMenu
- **File**: `src/components/nav/Navbar.tsx`
- **Props**: `unknown`

### RouteMemory
- **File**: `src/components/nav/RouteMemory.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Sidebar
- **File**: `src/components/nav/Sidebar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SidebarLinks
- **File**: `src/components/nav/SidebarLinks.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### WebVitalsDashboard
- **File**: `src/components/performance/WebVitalsDashboard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AnimatedSearchBar
- **File**: `src/components/search/AnimatedSearchBar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AnimatedTickerCard
- **File**: `src/components/search/AnimatedTickerCard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SearchBar
- **File**: `src/components/search/SearchBar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SearchFilters
- **File**: `src/components/search/SearchFilters.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SearchHistory
- **File**: `src/components/search/SearchHistory.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SearchResultsSummary
- **File**: `src/components/search/SearchResultsSummary.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### TickerCard
- **File**: `src/components/search/TickerCard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### MaterialButton
- **File**: `src/components/ui/MaterialButton.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PriceDepth
- **File**: `src/design-system/three/PriceDepth.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ToastProvider
- **File**: `src/lib/ui/ToastProvider.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SymbolPage
- **File**: `src/app/symbol/[ticker]/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SystemHealthPage
- **File**: `src/app/system/health/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Card
- **File**: `src/app/system/health/page.tsx`
- **Props**: `unknown`

### RootLayout
- **File**: `app/layout.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### HomePage
- **File**: `app/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ErrorBoundary
- **File**: `app/providers.tsx`
- **Props**: `unknown`

### ErrorCatcher
- **File**: `app/providers.tsx`
- **Props**: `unknown`

### PerformanceMonitor
- **File**: `app/providers.tsx`
- **Props**: `unknown`

### Providers
- **File**: `app/providers.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ModeLayout
- **File**: `app/[mode]/layout.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ModeNotFound
- **File**: `app/[mode]/not-found.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AnimationsDemo
- **File**: `app/animations-demo/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Page
- **File**: `app/click-demo/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ComparePage
- **File**: `app/compare/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### GlassButton
- **File**: `app/components/GlassButton.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### InstrumentScreener
- **File**: `app/components/InstrumentScreener.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### WhyInvest
- **File**: `app/components/WhyInvest.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Dashboard
- **File**: `app/dashboard/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AISignalsPanel
- **File**: `app/dashboard/page.tsx`
- **Props**: `unknown`

### History
- **File**: `app/history/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### UserDashboard
- **File**: `app/my-dashboard/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### OverviewView
- **File**: `app/my-dashboard/page.tsx`
- **Props**: `unknown`

### PerformanceView
- **File**: `app/my-dashboard/page.tsx`
- **Props**: `unknown`

### GoalsView
- **File**: `app/my-dashboard/page.tsx`
- **Props**: `unknown`

### CustomizeView
- **File**: `app/my-dashboard/page.tsx`
- **Props**: `unknown`

### Pentagon
- **File**: `app/pentagon/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Performance
- **File**: `app/performance/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Portfolio
- **File**: `app/portfolio/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Screener
- **File**: `app/screener/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SearchPage
- **File**: `app/search/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AnimatedSearchPage
- **File**: `app/search-animated/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### TradingPage
- **File**: `app/trading/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### DSPage
- **File**: `app/(ds)/ds/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PortfolioDetail
- **File**: `app/(trading)/components/PortfolioDetail.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### TradingDashboard
- **File**: `app/(trading)/components/TradingDashboard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### JournalModePage
- **File**: `app/[mode]/journal/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### OverviewModePage
- **File**: `app/[mode]/overview/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PortfolioModePage
- **File**: `app/[mode]/portfolio/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SettingsModePage
- **File**: `app/[mode]/settings/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### TradingModePage
- **File**: `app/[mode]/trading/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AdvisorDashboard
- **File**: `app/advisor/dashboard/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AISuggestionsPage
- **File**: `app/ai/suggestions/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PersonalAlerts
- **File**: `app/alerts/personal/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/account/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/alpaca/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/analytics/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/calendar/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/discover/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/factors/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/health/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/journal/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/journal/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/news/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/orders/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/orders/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/overview/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/performance/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/portfolio/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/portfolio/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/positions/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/search/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/signals/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/signals/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### PUT
- **File**: `app/api/signals/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### DELETE
- **File**: `app/api/signals/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/test-env/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/trades/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/trades/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/watchlist/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/watchlist/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### TradingDashboard
- **File**: `app/dashboard/trading/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### FilterPanel
- **File**: `app/dashboard/trading/page.tsx`
- **Props**: `unknown`

### TradeButtons
- **File**: `app/dashboard/trading/page.tsx`
- **Props**: `unknown`

### DiscoverPage
- **File**: `app/paper/discover/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SymbolPage
- **File**: `app/symbol/[id]/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SystemHealthPage
- **File**: `app/system/health/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### TradingDashboard
- **File**: `app/trading/components/TradingDashboard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### OnboardingPage
- **File**: `app/trading/onboarding/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### AISystemsLab
- **File**: `app/(lab)/lab/ai-systems/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### MiddlewareLab
- **File**: `app/(lab)/lab/middleware/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PerformanceLab
- **File**: `app/(lab)/lab/performance/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### ROIOverview
- **File**: `app/(lab)/lab/roi-overview/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### UXCursorLab
- **File**: `app/(lab)/lab/ux-cursor/page.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### EquityChart
- **File**: `app/(trading)/components/Overview/EquityChart.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### KPICard
- **File**: `app/(trading)/components/Overview/KPICard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### NotificationTray
- **File**: `app/(trading)/components/Overview/NotificationTray.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### OrdersTable
- **File**: `app/(trading)/components/Overview/OrdersTable.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### OverviewHeader
- **File**: `app/(trading)/components/Overview/OverviewHeader.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### OverviewPage
- **File**: `app/(trading)/components/Overview/OverviewPage.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### OverviewSkeleton
- **File**: `app/(trading)/components/Overview/OverviewPage.tsx`
- **Props**: `unknown`

### PnLCard
- **File**: `app/(trading)/components/Overview/PnLCard.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### PositionsTable
- **File**: `app/(trading)/components/Overview/PositionsTable.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### SearchBar
- **File**: `app/(trading)/components/Overview/SearchBar.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### Watchlist
- **File**: `app/(trading)/components/Overview/Watchlist.tsx`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/advice/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/ai/agents/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/agents/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/feedback/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/ai/genetic-algorithm/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/genetic-algorithm/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/ai/hybrid/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/hybrid/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/ai/meta-learning/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/meta-learning/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/ai/monitoring/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/monitoring/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/predict/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/alerts/eval/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/alpaca/assets/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/alpaca/trading/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/alpaca/trading/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/analytics/web-vitals/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/automation/run/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/backtest/start/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### ALL
- **File**: `app/api/gw/[...path]/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/gw/list/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/integrations/aggregate/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/market/backfill/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/notify/subscribe/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/notify/test/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/overview/stream/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/performance/metrics/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/pnl/daily/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/roi/alerts/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/roi/alerts/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/roi/auto-heal/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/roi/auto-heal/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/roi/evaluate/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/roi/evaluation/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/roi/evaluation/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/roi/parallel-sims/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/roi/parallel-sims/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/roi/prospective/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/roi/prospective/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/search/suggest/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/stream/sse/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/user/profile/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/user/profile/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/webhooks/alpaca/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/ai/agents/[id]/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### PUT
- **File**: `app/api/ai/agents/[id]/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### DELETE
- **File**: `app/api/ai/agents/[id]/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### POST
- **File**: `app/api/ai/suggestions/log/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/alpaca/market/bars/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/alpaca/market/quotes/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

### GET
- **File**: `app/api/alpaca/market/trades/route.ts`
- **Props**: `unknown`
- **Exported**: ✅

## 🧾 Types & Interfaces


### AnalyticsEvent
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").AnalyticsEvent`

### AIAlert
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").AIAlert`

### AlertRule
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").AlertRule`

### Position
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").Position`

### Account
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").Account`

### Order
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").Order`

### Bar
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").Bar`

### Quote
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").Quote`

### Trade
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").Trade`

### RateLimitState
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").RateLimitState`

### ToastType
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").ToastType`

### ToastMessage
- **File**: `src/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types").ToastMessage`

### Bar
- **File**: `src/components/AIAnalysisPanel.tsx`
- **Type**: `Bar`

### Bar
- **File**: `src/components/AISidePanel.tsx`
- **Type**: `Bar`

### AdviceItem
- **File**: `src/components/AdvisorChat.tsx`
- **Type**: `AdviceItem`

### NavLinkProps
- **File**: `src/components/AnimatedNavbar.tsx`
- **Fields**:
  - `href: string`
  - `children: React.ReactNode`
  - `className?: string | undefined`

### ChartTVProps
- **File**: `src/components/ChartTV.tsx`
- **Fields**:
  - `symbol: string`
  - `timeframe?: string | undefined`

### AssetLite
- **File**: `src/components/CommandPalette.tsx`
- **Type**: `AssetLite`

### Props
- **File**: `src/components/Projections.tsx`
- **Type**: `Props`

### StickyNavbarProps
- **File**: `src/components/StickyNavbar.tsx`
- **Fields**:
  - `children: React.ReactNode`

### T
- **File**: `src/components/ToastRail.tsx`
- **Type**: `T`

### Market
- **File**: `src/core/domain.ts`
- **Description**: Identités de base
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Market`

### Venue
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Venue`

### Side
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Side`

### OrderType
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").OrderType`

### TimeInForce
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").TimeInForce`

### Instrument
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `{ symbol: string; market: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Market; currency: string; name?: string | undefined; }`

### Candle
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `{ t: number; o: number; h: number; l: number; c: number; v: number; tf: string; }`

### Quote
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `{ t: number; bid: number | null; ask: number | null; mid: number | null; spread: number | null; source: string; }`

### Order
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `{ type: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").OrderType; status: "accepted" | "rejected" | "filled" | "canceled" | "pending"; id: string; venue: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Venue; instrument: { symbol: string; market: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Market; currency: string; name?: string | undefined; }; side: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Side; tif: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").TimeInForce; qty: number; createdAt: number; limitPrice?: number | undefined; stopPrice?: number | undefined; meta?: Record<string, any> | undefined; }`

### Position
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `{ id: string; instrument: { symbol: string; market: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Market; currency: string; name?: string | undefined; }; qty: number; avgPrice: number; pnl: number; updatedAt: number; }`

### Signal
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `{ tf: string; id: string; instrument: { symbol: string; market: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Market; currency: string; name?: string | undefined; }; createdAt: number; kind: string; score: number; features: Record<string, any>; rationale: string; }`

### Alert
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `{ id: string; signal: { tf: string; id: string; instrument: { symbol: string; market: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").Market; currency: string; name?: string | undefined; }; createdAt: number; kind: string; score: number; features: Record<string, any>; rationale: string; }; severity: "info" | "action" | "watch"; confirmedByRule: boolean; chart: { symbol: string; tf: string; from: number; to: number; }; }`

### HealthSnapshot
- **File**: `src/core/domain.ts`
- **Exported**: ✅
- **Type**: `{ ts: number; wsConnected: boolean; wsLatencyMs: number | null; restLatencyMs: number | null; providerErrors1m: number; queueLagMs: number | null; }`

### DomainEvent
- **File**: `src/core/domain.ts`
- **Description**: Événements bus (pub/sub)
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/core/domain").DomainEvent`

### SymbolItem
- **File**: `src/hooks/useSymbolSearch.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/hooks/useSymbolSearch").SymbolItem`

### Bus
- **File**: `src/lib/event-bus.ts`
- **Description**: Bus d'événements unique (UI et services partagent les mêmes events).
On peut enregistrer/rejouer les events pour tests & backtests UI.
- **Type**: `Bus`

### FeatureFlag
- **File**: `src/lib/flags.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/flags").FeatureFlag`

### OrderInput
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ symbol: string; type: "market" | "limit" | "stop" | "stop_limit"; side: "buy" | "sell"; qty: number; time_in_force: "day" | "gtc" | "opg" | "ioc" | "fok" | "cls"; limit_price?: number | undefined; stop_price?: number | undefined; client_order_id?: string | undefined; }`

### PositionData
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ symbol: string; side: "long" | "short"; qty: number; asset_id: string; exchange: string; asset_class: string; market_value: number; cost_basis: number; unrealized_pl: number; unrealized_plpc: number; unrealized_intraday_pl: number; unrealized_intraday_plpc: number; current_price: number; lastday_price: number; change_today: number; }`

### AccountData
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ currency: string; status: string; id: string; account_number: string; buying_power: number; regt_buying_power: number; daytrading_buying_power: number; non_marginable_buying_power: number; cash: number; accrued_fees: number; pending_transfer_out: number; pending_transfer_in: number; portfolio_value: number; pattern_day_trader: boolean; trading_blocked: boolean; transfers_blocked: boolean; account_blocked: boolean; created_at: string; trade_suspended_by_user: boolean; multiplier: number; shorting_enabled: boolean; equity: number; last_equity: number; long_market_value: number; short_market_value: number; initial_margin: number; maintenance_margin: number; last_maintenance_margin: number; sma: number; daytrade_count: number; }`

### BarData
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ t: string; o: number; h: number; l: number; c: number; v: number; n: number; vw: number; }`

### QuoteData
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ t: string; c: string[]; ax: string; ap: number; as: number; bx: string; bp: number; bs: number; z: string; }`

### TradeData
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ t: string; c: string[]; z: string; x: string; p: number; s: number; i: number; }`

### BarsRequestInput
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ symbols: string; timeframe: "5Min" | "1Min" | "15Min" | "1Hour" | "1Day"; feed: "iex" | "sip"; limit?: number | undefined; start?: string | undefined; end?: string | undefined; asof?: string | undefined; page_token?: string | undefined; }`

### QuotesRequestInput
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ symbols: string; feed: "iex" | "sip"; limit?: number | undefined; start?: string | undefined; end?: string | undefined; page_token?: string | undefined; }`

### TradesRequestInput
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ symbols: string; feed: "iex" | "sip"; limit?: number | undefined; start?: string | undefined; end?: string | undefined; page_token?: string | undefined; }`

### AIAlertData
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ symbol: string; message: string; score: number; rule: string; confidence: number; timestamp: string; actionable: boolean; }`

### ChartInteractionData
- **File**: `src/lib/zodSchemas.ts`
- **Exported**: ✅
- **Type**: `{ action: "crosshair" | "timeframe_change"; timestamp: number; symbol?: string | undefined; timeframe?: string | undefined; }`

### Provider
- **File**: `src/plugins/index.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/plugins/index").Provider`

### Fundamentals
- **File**: `src/services/factors.ts`
- **Exported**: ✅
- **Fields**:
  - `perf6m: number`
  - `perf12m: number`
  - `evToEbitda: number`
  - `pb: number`
  - `pe: number`
  - `roe: number`
  - `roic: number`
  - `netMargin: number`
  - `epsStdDev?: number | undefined`
  - `vol30: number`
  - `vol90: number`
  - `maxDrawdown: number`
  - `revCAGR3y?: number | undefined`
  - `epsCAGR3y?: number | undefined`

### AISettings
- **File**: `src/state/aiSettings.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/state/aiSettings").AISettings`

### Handler
- **File**: `src/state/bus.ts`
- **Type**: `Handler<T>`

### Tick
- **File**: `src/state/marketStore.ts`
- **Type**: `Tick`

### MarketState
- **File**: `src/state/marketStore.ts`
- **Type**: `MarketState`

### Holding
- **File**: `src/state/profile.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/state/profile").Holding`

### Goal
- **File**: `src/state/profile.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/state/profile").Goal`

### UserProfile
- **File**: `src/state/profile.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/state/profile").UserProfile`

### ProfileState
- **File**: `src/state/profile.ts`
- **Type**: `ProfileState`

### Snapshot
- **File**: `src/state/timeTravel.ts`
- **Type**: `Snapshot<T>`

### TTState
- **File**: `src/state/timeTravel.ts`
- **Type**: `TTState<T>`

### UIState
- **File**: `src/state/timeTravel.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/state/timeTravel").UIState`

### UIState
- **File**: `src/state/uiStore.ts`
- **Fields**:
  - `paletteOpen: boolean`
  - `setPaletteOpen: (open: boolean) => void`
  - `sidebarOpen: boolean`
  - `setSidebarOpen: (open: boolean) => void`
  - `theme: "light" | "dark"`
  - `setTheme: (theme: "light" | "dark") => void`

### WatchlistState
- **File**: `src/state/watchlist.ts`
- **Fields**:
  - `symbols: string[]`
  - `alerts: AlertRule[]`
  - `addSymbol: (s: string) => void`
  - `removeSymbol: (s: string) => void`
  - `addAlert: (a: AlertRule) => void`
  - `removeAlert: (idx: number) => void`

### AlertRule
- **File**: `src/state/watchlist.ts`
- **Type**: `AlertRule`

### Bar
- **File**: `src/types/market.ts`
- **Exported**: ✅
- **Fields**:
  - `t: string`
  - `o: number`
  - `h: number`
  - `l: number`
  - `c: number`
  - `v?: number | undefined`

### NewsItem
- **File**: `src/types/market.ts`
- **Exported**: ✅
- **Fields**:
  - `id: string`
  - `source: string`
  - `symbol?: string | undefined`
  - `headline: string`
  - `summary?: string | undefined`
  - `url?: string | undefined`
  - `publishedAt: string`
  - `sentiment?: number | undefined`

### CalendarEvent
- **File**: `src/types/market.ts`
- **Exported**: ✅
- **Fields**:
  - `id: string`
  - `kind: "earning" | "macro"`
  - `title: string`
  - `symbol?: string | undefined`
  - `country?: string | undefined`
  - `date: string`
  - `actual?: string | number | undefined`
  - `forecast?: string | number | undefined`
  - `previous?: string | number | undefined`
  - `importance?: "low" | "medium" | "high" | undefined`

### Factors
- **File**: `src/types/market.ts`
- **Exported**: ✅
- **Fields**:
  - `momentum: number`
  - `value: number`
  - `quality: number`
  - `risk: number`
  - `growth: number`

### PnLPoint
- **File**: `src/types/market.ts`
- **Exported**: ✅
- **Fields**:
  - `date: string`
  - `pnl: number`

### Trade
- **File**: `src/types/market.ts`
- **Exported**: ✅
- **Fields**:
  - `ts: string`
  - `symbol: string`
  - `side: "buy" | "sell"`
  - `qty: number`
  - `price: number`
  - `fee?: number | undefined`

### BacktestMetrics
- **File**: `src/types/market.ts`
- **Exported**: ✅
- **Fields**:
  - `cagr: number`
  - `sharpe: number`
  - `sortino: number`
  - `maxDrawdown: number`
  - `winRate: number`
  - `trades: number`

### Mode
- **File**: `src/types/market.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/types/market").Mode`

### CoachMessage
- **File**: `src/components/ai/AssistantCoach.tsx`
- **Fields**:
  - `id: string`
  - `type: "tip" | "warning" | "success" | "info"`
  - `title: string`
  - `message: string`
  - `action?: { label: string; onClick: () => void; } | undefined`
  - `timestamp: number`
  - `dismissed?: boolean | undefined`

### AssistantCoachProps
- **File**: `src/components/ai/AssistantCoach.tsx`
- **Fields**:
  - `userId?: string | undefined`
  - `context?: "trading" | "portfolio" | "analysis" | "general" | undefined`
  - `enabled?: boolean | undefined`

### Achievement
- **File**: `src/components/gamification/AchievementSystem.tsx`
- **Fields**:
  - `id: string`
  - `title: string`
  - `description: string`
  - `icon: string`
  - `category: "trading" | "portfolio" | "learning" | "social"`
  - `rarity: "common" | "rare" | "epic" | "legendary"`
  - `points: number`
  - `unlocked: boolean`
  - `unlockedAt?: number | undefined`
  - `progress?: number | undefined`
  - `maxProgress?: number | undefined`

### UserStats
- **File**: `src/components/gamification/AchievementSystem.tsx`
- **Fields**:
  - `level: number`
  - `experience: number`
  - `totalPoints: number`
  - `achievementsUnlocked: number`
  - `streak: number`
  - `lastActive: number`

### LeaderboardEntry
- **File**: `src/components/gamification/Leaderboard.tsx`
- **Fields**:
  - `id: string`
  - `username: string`
  - `avatar?: string | undefined`
  - `score: number`
  - `level: number`
  - `achievements: number`
  - `streak: number`
  - `rank: number`
  - `isCurrentUser?: boolean | undefined`

### LeaderboardProps
- **File**: `src/components/gamification/Leaderboard.tsx`
- **Fields**:
  - `type: "points" | "streak" | "achievements" | "performance"`
  - `timeframe: "daily" | "weekly" | "monthly" | "all-time"`

### TestResult
- **File**: `src/components/middleware/APITester.tsx`
- **Type**: `TestResult`

### ConfigState
- **File**: `src/components/middleware/ConfigPanel.tsx`
- **Type**: `ConfigState`

### Props
- **File**: `src/components/middleware/ErrorBoundary.tsx`
- **Fields**:
  - `children: React.ReactNode`
  - `fallback?: React.ReactNode`

### State
- **File**: `src/components/middleware/ErrorBoundary.tsx`
- **Fields**:
  - `hasError: boolean`
  - `error?: Error | undefined`
  - `errorInfo?: React.ErrorInfo | undefined`

### Props
- **File**: `src/components/middleware/LoadingSpinner.tsx`
- **Type**: `Props`

### MetricData
- **File**: `src/components/middleware/PerformanceMetrics.tsx`
- **Type**: `MetricData`

### QueueJob
- **File**: `src/components/middleware/QueueMonitor.tsx`
- **Type**: `QueueJob`

### QueueStats
- **File**: `src/components/middleware/QueueMonitor.tsx`
- **Type**: `QueueStats`

### HealthStatus
- **File**: `src/components/middleware/StatusDashboard.tsx`
- **Type**: `HealthStatus`

### PluginInfo
- **File**: `src/components/middleware/StatusDashboard.tsx`
- **Type**: `PluginInfo`

### MobileDrawerProps
- **File**: `src/components/nav/MobileDrawer.tsx`
- **Fields**:
  - `open: boolean`
  - `onClose: () => void`

### SidebarLinksProps
- **File**: `src/components/nav/SidebarLinks.tsx`
- **Fields**:
  - `item: { key: string; label: string; path: string; kbd?: string | undefined; }`

### AppMode
- **File**: `src/components/nav/nav.config.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/components/nav/nav.config").AppMode`

### NavItem
- **File**: `src/components/nav/nav.config.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/components/nav/nav.config").NavItem`

### VirtualizedListProps
- **File**: `src/components/optimized/VirtualizedList.tsx`
- **Fields**:
  - `items: T[]`
  - `height: number`
  - `itemHeight: number`
  - `renderItem: (props: { index: number; style: React.CSSProperties; item: T; }) => React.ReactNode`
  - `className?: string | undefined`
  - `overscanCount?: number | undefined`

### AnimatedSearchBarProps
- **File**: `src/components/search/AnimatedSearchBar.tsx`
- **Fields**:
  - `onResults: (items: any[]) => void`
  - `onQueryChange?: ((query: string) => void) | undefined`

### AnimatedTickerCardProps
- **File**: `src/components/search/AnimatedTickerCard.tsx`
- **Fields**:
  - `item: { symbol: string; name?: string | undefined; type: string; price?: number | undefined; change1d?: number | undefined; change1w?: number | undefined; change1m?: number | undefined; volumeAvg?: number | undefined; marketCap?: number | undefined; pe?: number | undefined; dividendYield?: number | undefined; esg?: { score?: number | undefined; grade?: string | undefined; } | undefined; logoUrl?: string | undefined; sector?: string | undefined; score?: number | undefined; reason?: string | undefined; spark?: number[] | undefined; }`
  - `onAddWatch?: ((symbol: string) => void) | undefined`
  - `onCompare?: ((symbol: string) => void) | undefined`
  - `onAlert?: ((symbol: string) => void) | undefined`
  - `index?: number | undefined`

### FilterOptions
- **File**: `src/components/search/SearchFilters.tsx`
- **Type**: `FilterOptions`

### Props
- **File**: `src/components/search/SearchFilters.tsx`
- **Type**: `Props`

### SearchHistoryItem
- **File**: `src/components/search/SearchHistory.tsx`
- **Type**: `SearchHistoryItem`

### Props
- **File**: `src/components/search/SearchResultsSummary.tsx`
- **Type**: `Props`

### Props
- **File**: `src/components/search/TickerCard.tsx`
- **Type**: `Props`

### MaterialButtonProps
- **File**: `src/components/ui/MaterialButton.tsx`
- **Fields**:
  - `ripple?: boolean | undefined`
  - `animated?: boolean | undefined`

### Strategy
- **File**: `src/features/backtesting/index.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/backtesting/index").Strategy`

### BacktestInput
- **File**: `src/features/backtesting/index.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/backtesting/index").BacktestInput`

### BacktestOutput
- **File**: `src/features/backtesting/index.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/backtesting/index").BacktestOutput`

### ScreenerRow
- **File**: `src/features/screener/index.ts`
- **Description**: Screener minimal: filtre et scoring de symboles selon règles & snapshots.
Branche-toi sur tes sources (quotes/candles) et renvoie un top-N.
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/screener/index").ScreenerRow`

### ScreenerQuery
- **File**: `src/features/screener/index.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/features/screener/index").ScreenerQuery`

### WLItem
- **File**: `src/features/watchlist/index.ts`
- **Type**: `WLItem`

### WLState
- **File**: `src/features/watchlist/index.ts`
- **Type**: `WLState`

### Agent
- **File**: `src/lib/agents/registry.ts`
- **Exported**: ✅
- **Fields**:
  - `name: string`
  - `run: (o: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/agents/registry").Obs) => Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/agents/registry").AgentOutput>`

### Obs
- **File**: `src/lib/agents/registry.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/agents/registry").Obs`

### AgentOutput
- **File**: `src/lib/agents/registry.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/agents/registry").AgentOutput`

### RNNConfig
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Description**: RNN dynamique "DG-RNN": cellules temporelles + interactions spatiales entre features.
Objectif: signal ROI(t) ≈ f( features[t-L..t], états cachés ).
≠ DeepLearn libs: ce runner est CPU-friendly, parfait pour inference rapide dans UI/lab.
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/ai/dynamic-rnn").RNNConfig`

### RNNState
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/ai/dynamic-rnn").RNNState`

### AlpacaHeaders
- **File**: `src/lib/api/alpaca.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/api/alpaca").AlpacaHeaders`

### OrderRequest
- **File**: `src/lib/api/alpaca.ts`
- **Exported**: ✅
- **Type**: `{ symbol: string; type: "market" | "limit" | "stop" | "stop_limit"; qty: string | number; side: "buy" | "sell"; time_in_force: "day" | "gtc" | "opg" | "cls" | "ioc" | "fok"; limit_price?: number | undefined; stop_price?: number | undefined; }`

### BarsRequest
- **File**: `src/lib/api/alpaca.ts`
- **Exported**: ✅
- **Type**: `{ symbols: string; timeframe: "1Min" | "5Min" | "15Min" | "1Hour" | "1Day"; feed: "iex" | "sip"; limit?: number | undefined; start?: string | null | undefined; end?: string | null | undefined; asof?: string | null | undefined; page_token?: string | null | undefined; }`

### QuotesRequest
- **File**: `src/lib/api/alpaca.ts`
- **Exported**: ✅
- **Type**: `{ symbols: string; feed: "iex" | "sip"; limit?: number | undefined; start?: string | null | undefined; end?: string | null | undefined; page_token?: string | null | undefined; }`

### TradesRequest
- **File**: `src/lib/api/alpaca.ts`
- **Exported**: ✅
- **Type**: `{ symbols: string; feed: "iex" | "sip"; limit?: number | undefined; start?: string | null | undefined; end?: string | null | undefined; page_token?: string | null | undefined; }`

### Entry
- **File**: `src/lib/cache/lru.ts`
- **Type**: `Entry<T>`

### Command
- **File**: `src/lib/commands/registry.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/commands/registry").Command`

### Props
- **File**: `src/lib/errors/ErrorBoundary.tsx`
- **Type**: `Props`

### State
- **File**: `src/lib/errors/ErrorBoundary.tsx`
- **Type**: `State`

### ErrorCode
- **File**: `src/lib/errors/error-catalog.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/errors/error-catalog").ErrorCode`

### Gene
- **File**: `src/lib/evo/ga.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/evo/ga").Gene`

### Fitness
- **File**: `src/lib/evo/ga.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/evo/ga").Fitness`

### EvalFn
- **File**: `src/lib/evo/ga.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/evo/ga").EvalFn`

### OrderClickData
- **File**: `src/lib/handlers/clickHandlers.ts`
- **Exported**: ✅
- **Fields**:
  - `symbol: string`
  - `side: "buy" | "sell"`
  - `quantity: number`
  - `orderType: "market" | "limit" | "stop" | "stop_limit"`
  - `limitPrice?: number | undefined`
  - `stopPrice?: number | undefined`
  - `tif?: "day" | "gtc" | "opg" | "cls" | "ioc" | "fok" | undefined`
  - `mode: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").TradingMode`
  - `meta?: Record<string, unknown> | undefined`

### PositionClickData
- **File**: `src/lib/handlers/clickHandlers.ts`
- **Exported**: ✅
- **Fields**:
  - `symbol: string`
  - `action: "close" | "modify" | "view"`
  - `positionId: string`

### NotificationClickData
- **File**: `src/lib/handlers/clickHandlers.ts`
- **Exported**: ✅
- **Fields**:
  - `notificationId: string`
  - `action: "mark_read" | "dismiss" | "view_details"`

### ChartClickData
- **File**: `src/lib/handlers/clickHandlers.ts`
- **Exported**: ✅
- **Fields**:
  - `symbol: string`
  - `timeframe: string`
  - `price?: number | undefined`
  - `timestamp?: string | undefined`

### NavigationClickData
- **File**: `src/lib/handlers/clickHandlers.ts`
- **Exported**: ✅
- **Fields**:
  - `route: string`
  - `params?: Record<string, any> | undefined`

### TradingMode
- **File**: `src/lib/handlers/clickHandlers.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").TradingMode`

### OrderClickData
- **File**: `src/lib/handlers/types.ts`
- **Exported**: ✅
- **Fields**:
  - `symbol: string`
  - `side: "buy" | "sell"`
  - `quantity: number`
  - `orderType?: "market" | "limit" | "stop" | "stop_limit" | undefined`
  - `limitPrice?: number | undefined`
  - `stopPrice?: number | undefined`
  - `tif?: "day" | "gtc" | "opg" | "cls" | "ioc" | "fok" | undefined`
  - `mode: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").TradingMode`
  - `meta?: Record<string, unknown> | undefined`

### PositionClickData
- **File**: `src/lib/handlers/types.ts`
- **Exported**: ✅
- **Fields**:
  - `symbol: string`
  - `positionId: string`
  - `action: "close" | "modify" | "view"`
  - `payload?: Record<string, unknown> | undefined`

### NotificationClickData
- **File**: `src/lib/handlers/types.ts`
- **Exported**: ✅
- **Fields**:
  - `notificationId: string`
  - `action: "view" | "dismiss" | "read"`

### ChartClickData
- **File**: `src/lib/handlers/types.ts`
- **Exported**: ✅
- **Fields**:
  - `symbol: string`
  - `event: "price_click" | "crosshair_move" | "timeframe_change" | "symbol_change" | "indicator_toggle"`
  - `value?: number | undefined`
  - `timestampIso?: string | undefined`
  - `params?: Record<string, unknown> | undefined`

### NavigationClickData
- **File**: `src/lib/handlers/types.ts`
- **Exported**: ✅
- **Fields**:
  - `route: string`
  - `params?: Record<string, string | number | boolean> | undefined`

### HandlerResult
- **File**: `src/lib/handlers/types.ts`
- **Exported**: ✅
- **Fields**:
  - `ok: boolean`
  - `message?: string | undefined`
  - `code?: string | undefined`

### TradingMode
- **File**: `src/lib/handlers/types.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/types").TradingMode`

### UseClickHandlersReturn
- **File**: `src/lib/hooks/useClickHandlers.ts`
- **Exported**: ✅
- **Fields**:
  - `handleOrderClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").OrderClickData) => Promise<boolean>`
  - `handleQuickBuy: (symbol: string, mode: "paper" | "live") => Promise<boolean>`
  - `handleQuickSell: (symbol: string, mode: "paper" | "live") => Promise<boolean>`
  - `handlePositionClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").PositionClickData) => Promise<boolean>`
  - `handleNotificationClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").NotificationClickData) => Promise<boolean>`
  - `handleChartClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").ChartClickData) => Promise<boolean>`
  - `handleNavigationClick: (data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/handlers/clickHandlers").NavigationClickData) => Promise<boolean>`
  - `isLoading: boolean`
  - `error: string | null`
  - `lastAction: string | null`

### Rule
- **File**: `src/lib/hybrid/hybridModel.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/hybrid/hybridModel").Rule`

### HybridScore
- **File**: `src/lib/hybrid/hybridModel.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/hybrid/hybridModel").HybridScore`

### PrefetchOptions
- **File**: `src/lib/performance/prefetch.ts`
- **Fields**:
  - `priority?: "high" | "low" | undefined`
  - `timeout?: number | undefined`
  - `retries?: number | undefined`

### PrefetchItem
- **File**: `src/lib/performance/prefetch.ts`
- **Fields**:
  - `url: string`
  - `type: "script" | "style" | "image" | "fetch"`
  - `priority: "high" | "low"`
  - `loaded: boolean`
  - `timestamp: number`

### WebVitalsMetric
- **File**: `src/lib/performance/web-vitals.ts`
- **Exported**: ✅
- **Fields**:
  - `name: string`
  - `value: number`
  - `delta: number`
  - `id: string`
  - `rating: "good" | "needs-improvement" | "poor"`
  - `timestamp: number`

### WebVitalsConfig
- **File**: `src/lib/performance/web-vitals.ts`
- **Exported**: ✅
- **Fields**:
  - `reportAllChanges?: boolean | undefined`
  - `debug?: boolean | undefined`
  - `endpoint?: string | undefined`
  - `sampleRate?: number | undefined`

### Prospect
- **File**: `src/lib/prospect/memory.ts`
- **Type**: `Prospect`

### SearchResult
- **File**: `src/lib/search/engine.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/search/engine").SearchResult`

### ParallelConfig
- **File**: `src/lib/sim/parallel.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/sim/parallel").ParallelConfig`

### Toast
- **File**: `src/lib/toast/ToastService.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/toast/ToastService").Toast`

### Callback
- **File**: `src/lib/toast/ToastService.ts`
- **Type**: `Callback`

### KPI
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").KPI`

### CurvePoint
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").CurvePoint`

### PositionRow
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").PositionRow`

### OrderRow
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").OrderRow`

### WatchItem
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").WatchItem`

### NotificationRow
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").NotificationRow`

### OverviewPayload
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").OverviewPayload`

### SSEEvent
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").SSEEvent`

### WatchlistAction
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").WatchlistAction`

### WatchlistResponse
- **File**: `src/lib/types/overview.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").WatchlistResponse`

### WLItem
- **File**: `src/lib/watchlist/WatchlistService.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/watchlist/WatchlistService").WLItem`

### Opts
- **File**: `src/lib/ws/useMarketStream.ts`
- **Type**: `Opts`

### Bar
- **File**: `src/lib/search/providers/alpaca.ts`
- **Type**: `Bar`

### TickerInfo
- **File**: `src/lib/search/providers/alpaca.ts`
- **Exported**: ✅
- **Type**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/search/providers/alpaca").TickerInfo`

### ModeLayoutProps
- **File**: `app/[mode]/layout.tsx`
- **Fields**:
  - `children: React.ReactNode`
  - `params: { mode: string; }`

### NotFoundProps
- **File**: `app/[mode]/not-found.tsx`
- **Fields**:
  - `params: { mode: string; }`

### ClickHandlerProps
- **File**: `app/components/ClickHandler.tsx`
- **Fields**:
  - `children: React.ReactNode`
  - `onClick?: ((event: React.MouseEvent<Element, MouseEvent>) => void) | undefined`
  - `onOrderClick?: ((data: any) => void) | undefined`
  - `onPositionClick?: ((data: any) => void) | undefined`
  - `onNotificationClick?: ((data: any) => void) | undefined`
  - `onChartClick?: ((data: any) => void) | undefined`
  - `onNavigationClick?: ((data: any) => void) | undefined`
  - `disabled?: boolean | undefined`
  - `loading?: boolean | undefined`
  - `className?: string | undefined`
  - `variant?: "default" | "hover" | "press" | "ripple" | undefined`
  - `data?: any`

### Props
- **File**: `app/components/GlassButton.tsx`
- **Type**: `Props`

### Instrument
- **File**: `app/components/InstrumentScreener.tsx`
- **Fields**:
  - `id: string`
  - `symbol: string`
  - `name: string`
  - `type: string`
  - `sector?: string | undefined`
  - `region?: string | undefined`
  - `price: number`
  - `changePercent: number`
  - `volume?: number | undefined`
  - `avgVolume?: number | undefined`
  - `marketCap?: number | undefined`
  - `volatility?: number | undefined`
  - `liquidityScore?: number | undefined`
  - `tags: string[]`
  - `sparkline?: number[] | undefined`

### FilterOptions
- **File**: `app/components/InstrumentScreener.tsx`
- **Fields**:
  - `types: string[]`
  - `sectors: string[]`
  - `regions: string[]`
  - `priceRange: [number, number]`
  - `changeRange: [number, number]`
  - `volatilityRange: [number, number]`
  - `liquidityRange: [number, number]`

### InstrumentScreenerProps
- **File**: `app/components/InstrumentScreener.tsx`
- **Fields**:
  - `instruments: Instrument[]`
  - `onInstrumentSelect?: ((instrument: Instrument) => void) | undefined`
  - `onAddToWatchlist?: ((instrument: Instrument) => void) | undefined`
  - `className?: string | undefined`

### NavigationProps
- **File**: `app/components/Navigation.tsx`
- **Fields**:
  - `title?: string | undefined`
  - `showBack?: boolean | undefined`
  - `showSearch?: boolean | undefined`
  - `showSettings?: boolean | undefined`
  - `showHome?: boolean | undefined`

### WhyInvestProps
- **File**: `app/components/WhyInvest.tsx`
- **Fields**:
  - `instrument: { symbol: string; name: string; type: string; sector?: string | undefined; region?: string | undefined; price: number; changePercent: number; marketCap?: number | undefined; expenseRatio?: number | undefined; dividendYield?: number | undefined; volatility?: number | undefined; beta?: number | undefined; liquidityScore?: number | undefined; tags?: string[] | undefined; }`
  - `className?: string | undefined`

### WindBackgroundProps
- **File**: `app/components/WindBackground.tsx`
- **Fields**:
  - `children: React.ReactNode`
  - `className?: string | undefined`

### DashboardData
- **File**: `app/dashboard/page.tsx`
- **Fields**:
  - `instruments: any[]`
  - `portfolioData: any[]`
  - `aiSignals: any[]`
  - `watchlist: any[]`
  - `user: { id: string; name: string; email: string; mode: "paper" | "live"; }`

### Trade
- **File**: `app/history/page.tsx`
- **Fields**:
  - `id: string`
  - `symbol: string`
  - `side: "buy" | "sell"`
  - `qty: number`
  - `price: number`
  - `ts: string`
  - `orderId?: string | undefined`

### UserMetrics
- **File**: `app/my-dashboard/page.tsx`
- **Fields**:
  - `totalReturn: number`
  - `totalReturnPercent: number`
  - `winRate: number`
  - `totalTrades: number`
  - `avgWin: number`
  - `avgLoss: number`
  - `sharpeRatio: number`
  - `maxDrawdown: number`
  - `bestPerformer: { symbol: string; return: number; }`
  - `worstPerformer: { symbol: string; return: number; }`

### CustomGoal
- **File**: `app/my-dashboard/page.tsx`
- **Fields**:
  - `id: string`
  - `title: string`
  - `target: number`
  - `current: number`
  - `deadline: string`
  - `type: "return" | "trades" | "winrate" | "drawdown"`

### FactorData
- **File**: `app/pentagon/page.tsx`
- **Fields**:
  - `symbol: string`
  - `momentum: number`
  - `value: number`
  - `quality: number`
  - `risk: number`
  - `growth: number`
  - `asOf: string`

### PerformanceMetrics
- **File**: `app/performance/page.tsx`
- **Fields**:
  - `totalReturn: number`
  - `annualizedReturn: number`
  - `sharpeRatio: number`
  - `maxDrawdown: number`
  - `winRate: number`
  - `profitFactor: number`
  - `volatility: number`
  - `calmarRatio: number`

### PerformanceData
- **File**: `app/performance/page.tsx`
- **Fields**:
  - `date: string`
  - `equity: number`
  - `returns: number`
  - `drawdown: number`
  - `benchmark?: number | undefined`

### Position
- **File**: `app/portfolio/page.tsx`
- **Fields**:
  - `id: string`
  - `symbol: string`
  - `qty: number`
  - `avgPrice: number`
  - `marketPrice: number`
  - `pnl: number`
  - `pnlPct: number`
  - `sector?: string | undefined`
  - `updatedAt: string`

### DailyPnl
- **File**: `app/portfolio/page.tsx`
- **Fields**:
  - `date: string`
  - `equity: number`
  - `realized: number`
  - `unrealized: number`

### FactorData
- **File**: `app/screener/page.tsx`
- **Fields**:
  - `symbol: string`
  - `momentum: number`
  - `value: number`
  - `quality: number`
  - `risk: number`
  - `growth: number`
  - `asOf: string`

### PortfolioDetailProps
- **File**: `app/(trading)/components/PortfolioDetail.tsx`
- **Fields**:
  - `mode: "paper" | "live"`

### TradingDashboardProps
- **File**: `app/(trading)/components/TradingDashboard.tsx`
- **Fields**:
  - `mode: "paper" | "live"`

### JournalModePageProps
- **File**: `app/[mode]/journal/page.tsx`
- **Fields**:
  - `params: { mode: string; }`

### OverviewModePageProps
- **File**: `app/[mode]/overview/page.tsx`
- **Fields**:
  - `params: { mode: string; }`

### PortfolioModePageProps
- **File**: `app/[mode]/portfolio/page.tsx`
- **Fields**:
  - `params: { mode: string; }`

### SettingsModePageProps
- **File**: `app/[mode]/settings/page.tsx`
- **Fields**:
  - `params: { mode: string; }`

### TradingModePageProps
- **File**: `app/[mode]/trading/page.tsx`
- **Fields**:
  - `params: { mode: string; }`

### P
- **File**: `app/advisor/dashboard/page.tsx`
- **Type**: `Props`

### Bar
- **File**: `app/ai/suggestions/page.tsx`
- **Type**: `Bar`

### Item
- **File**: `app/ai/suggestions/page.tsx`
- **Type**: `Item`

### Rule
- **File**: `app/alerts/personal/page.tsx`
- **Type**: `Rule`

### ButtonProps
- **File**: `app/components/ui/Button.tsx`
- **Fields**:
  - `variant?: "primary" | "secondary" | "danger" | "success" | "warning" | undefined`
  - `size?: "sm" | "md" | "lg" | undefined`
  - `loading?: boolean | undefined`
  - `children: React.ReactNode`

### CardProps
- **File**: `app/components/ui/Card.tsx`
- **Fields**:
  - `hover?: boolean | undefined`
  - `children: React.ReactNode`

### RowItem
- **File**: `app/dashboard/trading/page.tsx`
- **Type**: `RowItem`

### Stock
- **File**: `app/paper/discover/page.tsx`
- **Fields**:
  - `symbol: string`
  - `name: string`
  - `price: number`
  - `change: number`
  - `changePercent: number`
  - `volume: number`
  - `marketCap: number`
  - `sector: string`

### AdvancedChartProps
- **File**: `app/trading/components/AdvancedChart.tsx`
- **Fields**:
  - `symbol: string`
  - `timeframe: string`
  - `className?: string | undefined`

### BacktestResults
- **File**: `app/trading/components/AdvancedChart.tsx`
- **Fields**:
  - `trades: number`
  - `winRate: number`
  - `maxDD: number`
  - `sharpe: number`

### TradingDecision
- **File**: `app/trading/components/AdvancedChart.tsx`
- **Fields**:
  - `action: "buy" | "sell" | "hold"`
  - `reason: string`
  - `confidence: number`
  - `order?: { qty: number; side: "buy" | "sell"; stop_loss?: { stop_price: number; } | undefined; take_profit?: { limit_price: number; } | undefined; } | undefined`

### CandlestickData
- **File**: `app/trading/components/AdvancedChart.tsx`
- **Fields**:
  - `time: string`
  - `open: number`
  - `high: number`
  - `low: number`
  - `close: number`

### VolumeData
- **File**: `app/trading/components/AdvancedChart.tsx`
- **Fields**:
  - `time: string`
  - `value: number`
  - `color: string`

### Trade
- **File**: `app/trading/components/JournalTable.tsx`
- **Fields**:
  - `id: string`
  - `symbol: string`
  - `side: "buy" | "sell"`
  - `quantity: number`
  - `price: number`
  - `timestamp: string`
  - `pnl?: number | undefined`
  - `pnlPercent?: number | undefined`
  - `status: "filled" | "pending" | "cancelled"`
  - `orderType: "market" | "limit"`
  - `notes?: string | undefined`

### JournalTableProps
- **File**: `app/trading/components/JournalTable.tsx`
- **Fields**:
  - `trades: Trade[]`
  - `onEditTrade: (tradeId: string) => void`
  - `onDeleteTrade: (tradeId: string) => void`

### Notification
- **File**: `app/trading/components/NotificationBell.tsx`
- **Fields**:
  - `id: string`
  - `title: string`
  - `message: string`
  - `type: "error" | "info" | "success" | "warning"`
  - `timestamp: string`
  - `read: boolean`

### NotificationBellProps
- **File**: `app/trading/components/NotificationBell.tsx`
- **Fields**:
  - `notifications: Notification[]`
  - `onNotificationClick: (notification: Notification) => void`
  - `onMarkAllRead: () => void`

### OrderTicketProps
- **File**: `app/trading/components/OrderTicket.tsx`
- **Fields**:
  - `symbol: string`
  - `currentPrice: number`
  - `mode: "paper" | "live"`
  - `onOrderSubmit?: ((order: OrderData) => void) | undefined`

### OrderData
- **File**: `app/trading/components/OrderTicket.tsx`
- **Fields**:
  - `side: "buy" | "sell"`
  - `quantity: number`
  - `orderType: "market" | "limit"`
  - `limitPrice?: number | undefined`

### Position
- **File**: `app/trading/components/PortfolioTable.tsx`
- **Fields**:
  - `symbol: string`
  - `quantity: number`
  - `avgPrice: number`
  - `currentPrice: number`
  - `marketValue: number`
  - `unrealizedPL: number`
  - `unrealizedPLPercent: number`
  - `side: "long" | "short"`

### PortfolioTableProps
- **File**: `app/trading/components/PortfolioTable.tsx`
- **Fields**:
  - `positions: Position[]`
  - `onClosePosition: (symbol: string) => void`

### Position
- **File**: `app/trading/components/TradingDashboard.tsx`
- **Fields**:
  - `symbol: string`
  - `quantity: number`
  - `avgPrice: number`
  - `currentPrice: number`
  - `marketValue: number`
  - `unrealizedPL: number`
  - `unrealizedPLPercent: number`
  - `side: "long" | "short"`

### Trade
- **File**: `app/trading/components/TradingDashboard.tsx`
- **Fields**:
  - `id: string`
  - `symbol: string`
  - `side: "buy" | "sell"`
  - `quantity: number`
  - `price: number`
  - `timestamp: string`
  - `pnl?: number | undefined`
  - `pnlPercent?: number | undefined`
  - `status: "filled" | "pending" | "cancelled"`
  - `orderType: "market" | "limit"`
  - `notes?: string | undefined`

### Notification
- **File**: `app/trading/components/TradingDashboard.tsx`
- **Fields**:
  - `id: string`
  - `title: string`
  - `message: string`
  - `type: "info" | "success" | "warning" | "error"`
  - `timestamp: string`
  - `read: boolean`

### EquityChartProps
- **File**: `app/(trading)/components/Overview/EquityChart.tsx`
- **Fields**:
  - `data: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").CurvePoint[]`

### KPICardProps
- **File**: `app/(trading)/components/Overview/KPICard.tsx`
- **Fields**:
  - `title: string`
  - `value: number`
  - `format: "number" | "currency" | "percent"`
  - `trend?: number | undefined`
  - `showTrend?: boolean | undefined`

### NotificationTrayProps
- **File**: `app/(trading)/components/Overview/NotificationTray.tsx`
- **Fields**:
  - `notifications: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").NotificationRow[]`
  - `mode: "paper" | "live"`

### OrdersTableProps
- **File**: `app/(trading)/components/Overview/OrdersTable.tsx`
- **Fields**:
  - `orders: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").OrderRow[]`
  - `mode: "paper" | "live"`
  - `onOrderClick?: ((order: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").OrderRow) => void) | undefined`

### OverviewHeaderProps
- **File**: `app/(trading)/components/Overview/OverviewHeader.tsx`
- **Fields**:
  - `mode: "paper" | "live"`
  - `asOf: string`
  - `isConnected: boolean`
  - `lastUpdate?: string | undefined`

### OverviewPageProps
- **File**: `app/(trading)/components/Overview/OverviewPage.tsx`
- **Fields**:
  - `mode: "paper" | "live"`

### PnLCardProps
- **File**: `app/(trading)/components/Overview/PnLCard.tsx`
- **Fields**:
  - `dayPnL: number`

### PositionsTableProps
- **File**: `app/(trading)/components/Overview/PositionsTable.tsx`
- **Fields**:
  - `positions: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").PositionRow[]`
  - `mode: "paper" | "live"`

### SearchResult
- **File**: `app/(trading)/components/Overview/SearchBar.tsx`
- **Fields**:
  - `id: string`
  - `type: "symbol" | "page" | "action"`
  - `title: string`
  - `subtitle?: string | undefined`
  - `href: string`
  - `icon?: string | undefined`

### WatchlistProps
- **File**: `app/(trading)/components/Overview/Watchlist.tsx`
- **Fields**:
  - `items: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/types/overview").WatchItem[]`
  - `mode: "paper" | "live"`

### Bar
- **File**: `app/api/ai/advice/route.ts`
- **Type**: `Bar`

### Asset
- **File**: `app/api/alpaca/assets/route.ts`
- **Type**: `Asset`

### UseOverviewSSEReturn
- **File**: `app/(trading)/components/Overview/hooks/useOverviewSSE.ts`
- **Fields**:
  - `isConnected: boolean`
  - `lastUpdate?: string | undefined`
  - `error?: string | undefined`

## 🛠️ Utilities


### getServerFlags
- **File**: `src/lib/flags.ts`
- **Params**: none
- **Returns**: `Record<string, boolean>`
- **Exported**: ✅

### hashParams
- **File**: `src/lib/hash.ts`
- **Params**: obj: unknown
- **Returns**: `string`
- **Exported**: ✅

### formatCurrency
- **File**: `src/lib/overview.ts`
- **Params**: amount: number
- **Returns**: `string`
- **Exported**: ✅

### formatPercent
- **File**: `src/lib/overview.ts`
- **Params**: percent: number
- **Returns**: `string`
- **Exported**: ✅

### calculatePnLColor
- **File**: `src/lib/overview.ts`
- **Params**: pnl: number
- **Returns**: `string`
- **Exported**: ✅

### calculatePnLBgColor
- **File**: `src/lib/overview.ts`
- **Params**: pnl: number
- **Returns**: `string`
- **Exported**: ✅

### getRateLimitKey
- **File**: `src/lib/rateLimit.ts`
- **Params**: prefix: string, identifier: string
- **Returns**: `string`
- **Exported**: ✅

### onKey
- **File**: `src/lib/shortcuts.ts`
- **Params**: element: Document | Element, key: string, handler: () => void
- **Returns**: `() => void`
- **Exported**: ✅

### formatDateTime
- **File**: `src/lib/time.ts`
- **Params**: ts: string | number, locale: string
- **Returns**: `string`
- **Exported**: ✅

### formatHm
- **File**: `src/lib/time.ts`
- **Params**: ts: string | number, locale: string
- **Returns**: `string`
- **Exported**: ✅

### cn
- **File**: `src/lib/utils.ts`
- **Params**: inputs: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/clsx/clsx").ClassValue[]
- **Returns**: `string`
- **Exported**: ✅

### rsi14
- **File**: `src/lib/agents/registry.ts`
- **Params**: closes: number[]
- **Returns**: `number`

### runAgents
- **File**: `src/lib/agents/registry.ts`
- **Params**: userEmail: string, obs: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/agents/registry").Obs, weights: { tech: number; sentiment: number; macro: number; }
- **Returns**: `Promise<{ fused: number; parts: { t: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/agents/registry").AgentOutput; s: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/agents/registry").AgentOutput; m: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/agents/registry").AgentOutput; }; }>`
- **Async**: ✅
- **Exported**: ✅

### makeRNN
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: cfg: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/ai/dynamic-rnn").RNNConfig
- **Returns**: `{ predict: (xSeq: number[][]) => { roi: number; state: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/ai/dynamic-rnn").RNNState; }; }`
- **Exported**: ✅

### rand
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: r: number, c: number, scale: number
- **Returns**: `Float64Array<ArrayBuffer>[]`

### mul
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: W: Float64Array<ArrayBufferLike>[], x: Float64Array<ArrayBufferLike>
- **Returns**: `Float64Array<ArrayBuffer>`

### add
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: a: Float64Array<ArrayBufferLike>, b: Float64Array<ArrayBufferLike>
- **Returns**: `Float64Array<ArrayBuffer>`

### addVec
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: a: Float64Array<ArrayBufferLike>, b: Float64Array<ArrayBufferLike>, alpha: number
- **Returns**: `Float64Array<ArrayBuffer>`

### tanh
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: a: Float64Array<ArrayBufferLike>
- **Returns**: `Float64Array<ArrayBuffer>`

### relu
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: a: Float64Array<ArrayBufferLike>
- **Returns**: `Float64Array<ArrayBuffer>`

### concat
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: a: Float64Array<ArrayBufferLike>, b: Float64Array<ArrayBufferLike>
- **Returns**: `Float64Array<ArrayBuffer>`

### dot
- **File**: `src/lib/ai/dynamic-rnn.ts`
- **Params**: W: Float64Array<ArrayBufferLike>[], x: Float64Array<ArrayBufferLike>
- **Returns**: `Float64Array<ArrayBuffer>`

### alpacaGET
- **File**: `src/lib/api/alpaca.ts`
- **Params**: url: string, init?: RequestInit | undefined
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### alpacaPOST
- **File**: `src/lib/api/alpaca.ts`
- **Params**: url: string, body: unknown
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### cacheGet
- **File**: `src/lib/cache/lru.ts`
- **Params**: k: string
- **Returns**: `T | null`
- **Exported**: ✅

### cacheSet
- **File**: `src/lib/cache/lru.ts`
- **Params**: k: string, v: T, ttl: number
- **Returns**: `void`
- **Exported**: ✅

### dedup
- **File**: `src/lib/cache/lru.ts`
- **Params**: k: string, fn: () => Promise<T>
- **Returns**: `Promise<T>`
- **Async**: ✅
- **Exported**: ✅

### cacheGet
- **File**: `src/lib/cache/redis.ts`
- **Params**: k: string
- **Returns**: `Promise<T | null>`
- **Async**: ✅
- **Exported**: ✅

### cacheSet
- **File**: `src/lib/cache/redis.ts`
- **Params**: k: string, v: any, ttlSec: number
- **Returns**: `Promise<void>`
- **Async**: ✅
- **Exported**: ✅

### cacheDel
- **File**: `src/lib/cache/redis.ts`
- **Params**: k: string
- **Returns**: `Promise<void>`
- **Async**: ✅
- **Exported**: ✅

### lyapunovProxy
- **File**: `src/lib/complex/chaos.ts`
- **Params**: series: number[]
- **Returns**: `number`
- **Exported**: ✅

### regimeState
- **File**: `src/lib/complex/chaos.ts`
- **Params**: series: number[]
- **Returns**: `"chaotic" | "turbulent" | "calm"`
- **Exported**: ✅

### consciousScore
- **File**: `src/lib/conscious/score.ts`
- **Params**: { 
  esg = { E: .5, S: .5, G: .5 }, 
  leverage = 1, 
  stress = 0.5 
}: { esg?: any; leverage: number; stress: number; }
- **Returns**: `{ ethic: number; social: number; emotion: number; }`
- **Exported**: ✅

### signToken
- **File**: `src/lib/core/jwt.ts`
- **Params**: payload: object, expiresIn: string
- **Returns**: `any`
- **Exported**: ✅

### verifyToken
- **File**: `src/lib/core/jwt.ts`
- **Params**: token?: string | undefined
- **Returns**: `T | null`
- **Exported**: ✅

### rnd
- **File**: `src/lib/evo/ga.ts`
- **Params**: a: number, b: number
- **Returns**: `number`

### clamp
- **File**: `src/lib/evo/ga.ts`
- **Params**: x: number, a: number, b: number
- **Returns**: `number`

### runGA
- **File**: `src/lib/evo/ga.ts`
- **Params**: evalFn: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/evo/ga").EvalFn, popSize: number, gens: number
- **Returns**: `Promise<{ gene: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/evo/ga").Gene; fit: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/evo/ga").Fitness; score: number; }>`
- **Async**: ✅
- **Exported**: ✅

### getOAuthClient
- **File**: `src/lib/google/oauth.ts`
- **Params**: none
- **Returns**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/google-auth-library/build/src/auth/oauth2client").OAuth2Client`
- **Exported**: ✅

### getAuthUrl
- **File**: `src/lib/google/oauth.ts`
- **Params**: none
- **Returns**: `string`
- **Exported**: ✅

### saveTokenCookie
- **File**: `src/lib/google/oauth.ts`
- **Params**: token: any
- **Returns**: `Promise<void>`
- **Async**: ✅
- **Exported**: ✅

### readTokenFromCookie
- **File**: `src/lib/google/oauth.ts`
- **Params**: none
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### getAuthedGmail
- **File**: `src/lib/google/oauth.ts`
- **Params**: none
- **Returns**: `Promise<{ gmail: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/googleapis/build/src/apis/gmail/v1").gmail_v1.Gmail; oauth2Client: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/node_modules/google-auth-library/build/src/auth/oauth2client").OAuth2Client; } | null>`
- **Async**: ✅
- **Exported**: ✅

### toBase64Url
- **File**: `src/lib/google/oauth.ts`
- **Params**: input: string
- **Returns**: `string`
- **Exported**: ✅

### buildDefaultRules
- **File**: `src/lib/hybrid/hybridModel.ts`
- **Params**: none
- **Returns**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/hybrid/hybridModel").Rule[]`
- **Exported**: ✅

### hybridScore
- **File**: `src/lib/hybrid/hybridModel.ts`
- **Params**: features: { don: number; mom: number; rsi: number; }, nnW: number[]
- **Returns**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/hybrid/hybridModel").HybridScore`
- **Exported**: ✅

### withRetry
- **File**: `src/lib/integrations/providers.ts`
- **Params**: fn: () => Promise<T>, tries: number
- **Returns**: `Promise<T>`
- **Async**: ✅

### macroNow
- **File**: `src/lib/integrations/providers.ts`
- **Params**: country: string
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### newsNow
- **File**: `src/lib/integrations/providers.ts`
- **Params**: query: string
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### weatherSignal
- **File**: `src/lib/integrations/providers.ts`
- **Params**: lat: number, lon: number
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### getMetaParams
- **File**: `src/lib/meta/metaLearner.ts`
- **Params**: userEmail: string
- **Returns**: `Promise<{ w: number[]; lr: number; }>`
- **Async**: ✅
- **Exported**: ✅

### fastAdapt
- **File**: `src/lib/meta/metaLearner.ts`
- **Params**: userEmail: string, gradient: [number, number, number]
- **Returns**: `Promise<[number, number, number]>`
- **Async**: ✅
- **Exported**: ✅

### monitorAndAutoCorrect
- **File**: `src/lib/monitor/autoCorrect.ts`
- **Params**: event: { kind: "drift" | "latency" | "error"; detail: string; meta?: any; }
- **Returns**: `Promise<void>`
- **Async**: ✅
- **Exported**: ✅

### trackLink
- **File**: `src/lib/perf/prefetch-ai.ts`
- **Params**: el: HTMLAnchorElement
- **Returns**: `() => void`
- **Exported**: ✅

### rememberProspect
- **File**: `src/lib/prospect/memory.ts`
- **Params**: email: string, p: Prospect
- **Returns**: `void`
- **Exported**: ✅

### listProspects
- **File**: `src/lib/prospect/memory.ts`
- **Params**: email: string
- **Returns**: `Prospect[]`
- **Exported**: ✅

### rateLimit
- **File**: `src/lib/rate/limiter.ts`
- **Params**: ip: string, max: number
- **Returns**: `Promise<boolean>`
- **Async**: ✅
- **Exported**: ✅

### stats
- **File**: `src/lib/roi/metrics.ts`
- **Params**: arr: number[]
- **Returns**: `{ mean: number; std: number; }`

### returnsFromPrices
- **File**: `src/lib/roi/metrics.ts`
- **Params**: px: number[]
- **Returns**: `number[]`
- **Exported**: ✅

### sharpe
- **File**: `src/lib/roi/metrics.ts`
- **Params**: returns: number[], rf: number
- **Returns**: `number`
- **Exported**: ✅

### sortino
- **File**: `src/lib/roi/metrics.ts`
- **Params**: returns: number[], rf: number
- **Returns**: `number`
- **Exported**: ✅

### calmar
- **File**: `src/lib/roi/metrics.ts`
- **Params**: returns: number[]
- **Returns**: `number`
- **Exported**: ✅

### var95
- **File**: `src/lib/roi/metrics.ts`
- **Params**: returns: number[]
- **Returns**: `number`
- **Exported**: ✅

### sensitivity
- **File**: `src/lib/roi/metrics.ts`
- **Params**: features: Record<string, number>, predict: (f: any) => number
- **Returns**: `{ base: number; grad: Record<string, number>; }`
- **Exported**: ✅

### causalScore
- **File**: `src/lib/roi/metrics.ts`
- **Params**: a: number[], b: number[], lag: number
- **Returns**: `number`
- **Exported**: ✅

### makeLRU
- **File**: `src/lib/search/cache.ts`
- **Params**: max: number
- **Returns**: `{ get(k: K): NonNullable<V> | undefined; set(k: K, v: V): void; has: (k: K) => boolean; }`
- **Exported**: ✅

### searchAll
- **File**: `src/lib/search/engine.ts`
- **Params**: q: string
- **Returns**: `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/search/engine").SearchResult[]>`
- **Async**: ✅
- **Exported**: ✅

### scoring
- **File**: `src/lib/search/engine.ts`
- **Params**: x: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/search/providers/alpaca").TickerInfo
- **Returns**: `{ score: number; reason: string; }`

### volatility
- **File**: `src/lib/search/engine.ts`
- **Params**: arr: number[]
- **Returns**: `number`

### suggestions
- **File**: `src/lib/search/engine.ts`
- **Params**: prefix: string
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### simulateUniverses
- **File**: `src/lib/sim/parallel.ts`
- **Params**: S0: number, cfg: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/sim/parallel").ParallelConfig
- **Returns**: `number[][]`
- **Exported**: ✅

### notifySuccess
- **File**: `src/lib/ui/ToastProvider.tsx`
- **Params**: msg: string
- **Returns**: `void`
- **Exported**: ✅

### notifyInfo
- **File**: `src/lib/ui/ToastProvider.tsx`
- **Params**: msg: string
- **Returns**: `void`
- **Exported**: ✅

### notifyError
- **File**: `src/lib/ui/ToastProvider.tsx`
- **Params**: code: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/errors/error-catalog").ErrorCode, detail?: string | undefined
- **Returns**: `void`
- **Exported**: ✅

### ToastProvider
- **File**: `src/lib/ui/ToastProvider.tsx`
- **Params**: none
- **Returns**: `React.JSX.Element`
- **Exported**: ✅

### load
- **File**: `src/lib/watchlist/WatchlistService.ts`
- **Params**: none
- **Returns**: `import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/watchlist/WatchlistService").WLItem[]`

### save
- **File**: `src/lib/watchlist/WatchlistService.ts`
- **Params**: it: import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/watchlist/WatchlistService").WLItem[]
- **Returns**: `void`

### alpacaSearchSymbols
- **File**: `src/lib/search/providers/alpaca.ts`
- **Params**: q: string
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### guessType
- **File**: `src/lib/search/providers/alpaca.ts`
- **Params**: a: any
- **Returns**: `"crypto" | "stock"`

### alpacaSnapshot
- **File**: `src/lib/search/providers/alpaca.ts`
- **Params**: symbol: string
- **Returns**: `Promise<import("/Users/jake/Projects /Trading_Spec/alpaca-auto-trading-app/src/lib/search/providers/alpaca").TickerInfo | null>`
- **Async**: ✅
- **Exported**: ✅

### alpacaIntradaySpark
- **File**: `src/lib/search/providers/alpaca.ts`
- **Params**: symbol: string
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

### enrichCompany
- **File**: `src/lib/search/providers/enrich.ts`
- **Params**: symbolOrName: string
- **Returns**: `Promise<{ logoUrl: string; sector: string; esg: { score: number; grade: string; }; marketCap: undefined; pe: undefined; dividendYield: undefined; } | { esg: { score: number; grade: string; }; logoUrl?: undefined; sector?: undefined; marketCap?: undefined; pe?: undefined; dividendYield?: undefined; }>`
- **Async**: ✅
- **Exported**: ✅

### fetchNewsHeadlines
- **File**: `src/lib/search/providers/enrich.ts`
- **Params**: symbol: string
- **Returns**: `Promise<any>`
- **Async**: ✅
- **Exported**: ✅

## 📊 Statistics

- **Services**: 280
- **Hooks**: 28
- **Components**: 205
- **Types**: 230
- **Utils**: 83
- **API Endpoints**: 0
- **Total Files Analyzed**: 307