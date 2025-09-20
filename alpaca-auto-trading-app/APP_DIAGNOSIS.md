# app_diagnosis
Generated: 2025-09-20T16:26:09.191Z

## Environment
- node: v23.11.0
- npm: 11.2.0

```
Operating System:
  Platform: darwin
  Arch: x64
  Version: Darwin Kernel Version 24.6.0: Mon Jul 14 11:28:17 PDT 2025; root:xnu-11417.140.69~1/RELEASE_X86_64
  Available memory (MB): 8192
  Available CPU cores: 4
Binaries:
  Node: 23.11.0
  npm: 11.2.0
  Yarn: N/A
  pnpm: 10.16.1
Relevant Packages:
  next: 14.2.32 // An outdated version detected (latest is 15.5.3), upgrade is highly recommended!
  eslint-config-next: 14.2.32
  react: 18.3.1
  react-dom: 18.3.1
  typescript: 5.9.2
Next.js Config:
  output: standalone
```

## Git
```
## feature/enhance-fastapi-config...origin/feature/enhance-fastapi-config [ahead 1]
 M __tests__/lib/indicators.test.ts
 M app/api/orders/route.ts
 M app/components/Navigation.tsx
 M app/components/WhyInvest.tsx
 M app/components/WindBackground.tsx
 M app/components/ui/Button.tsx
 M app/dashboard/page.tsx
 M app/globals.css
 M app/history/page.tsx
 M app/layout.tsx
 M app/my-dashboard/page.tsx
 M app/paper/discover/page.tsx
 M app/performance/page.tsx
 M app/providers.tsx
 M app/screener/page.tsx
 M app/search/page.tsx
 D app/symbol/[id]/page.tsx
 M app/system/health/page.tsx
 M app/trading/components/JournalTable.tsx
 M app/trading/components/NotificationBell.tsx
 M app/trading/components/OrderEntry.tsx
 M app/trading/components/OrderTicket.tsx
 M backend/app/api/v1/api_routes.py
 D components/ChartWrapper.tsx
 D components/DataTable.tsx
 D components/Navigation.tsx
 D components/Providers.tsx
 D components/flags/FeatureGate.tsx
 D components/nav/Breadcrumbs.tsx
 D components/nav/MobileDrawer.tsx
 D components/nav/ModeSwitcher.tsx
 D components/nav/Navbar.tsx
 D components/nav/RouteMemory.tsx
 D components/nav/Sidebar.tsx
 D components/nav/SidebarLinks.tsx
 D components/nav/nav-icons.tsx
 D components/nav/nav.config.ts
 D components/nav/route-helpers.ts
 D components/nav/useCommandPalette.ts
 D lib/adapters/alpaca/client.ts
 D lib/adapters/alpaca/types.ts
 D lib/ai-alerts/engine.ts
 D lib/ai-alerts/types.ts
 D lib/ai-alerts/useAISuggestions.ts
 D lib/ai/features.ts
 D lib/ai/predict.ts
 D lib/ai/signals.ts
 D lib/alpaca.ts
 D lib/alpaca/client.ts
 D lib/api/client.ts
 D lib/backtest/engine.ts
 D lib/backtest/runner.ts
 D lib/charts/adapters/lightweight.ts
 D lib/core/cache.ts
 D lib/core/domain.ts
 D lib/core/eventBus.ts
 D lib/db.ts
 D lib/errors.ts
 D lib/errors/ErrorBoundary.tsx
 D lib/errors/index.ts
 D lib/flags.ts
 D lib/handlers/ClickHandlerService.ts
 D lib/handlers/clickHandlers.ts
 D lib/handlers/types.ts
 D lib/handlers/useClickHandlers.ts
 D lib/hooks/useAlerts.ts
 D lib/hooks/useChartHandlers.ts
 D lib/hooks/useClickHandlers.ts
 D lib/indicators.ts
 D lib/notifications/service.ts
 D lib/overview.ts
 D lib/realtime.ts
 D lib/reportWebVitals.ts
 D lib/risk.ts
 D lib/server-flags.ts
 D lib/services/AlertsEngine.ts
 D lib/services/AnalyticsService.ts
 D lib/services/MarketDataService.ts
 D lib/services/RiskService.ts
 D lib/stores/streamStore.ts
 D lib/strategy/backtest.ts
 D lib/strategy/executor.ts
 D lib/strategy/signals.ts
 D lib/types/overview.ts
 D lib/utils.ts
 D lib/utils/risk-checks.ts
 D lib/validation.ts
 D lib/validations/trading.ts
 M package-lock.json
 M package.json
 M src/state/uiStore.ts
 M tsconfig.json
 M vitest.setup.ts
?? APP_DIAGNOSIS.md
?? __tests__/api/account.test.ts
?? __tests__/lib/pnl.test.ts
?? app/api/admin/
?? app/api/ohlc/
?? app/components/Navigation.module.css
?? app/item/
?? app/symbol/[symbol]/
?? backend/app/api/routes/
?? backend/app/settings.py
?? e2e/backtesting.spec.ts
?? e2e/basic.spec.ts
?? e2e/charts.spec.ts
?? e2e/screener.spec.ts
?? e2e/trading.spec.ts
?? k8s/
?? knowledge.json
?? lib/shortcuts.ts
?? lib/toast/
?? playwright-report/
?? playwright.config.ts
?? scripts/fix-imports.mjs
?? src/components/components/
?? src/lib/lib/
?? src/server/admin/
?? src/state/state/
?? test-results/
?? tools/
?? vitest.config.ts
```

## Required Exports
- src/state/uiStore.ts: ✅
  - export useUI: OK
- lib/shortcuts.ts: ✅
  - export onKey: OK
  - export combos: OK
- lib/toast/ToastService.ts: ✅
  - export Toasts: OK
  - export ToastViewport: OK

## Alias & Imports to verify
- No alias imports found in critical files

## tsconfig.paths (alias)
```
{
  "@/*": [
    "src/*"
  ]
}
```

## ESLint (summary)
```
ERROR: 
./app/(trading)/components/Overview/OverviewPage.tsx
32:6  Warning: React Hook useEffect has a missing dependency: 'fetchOverviewData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./app/(trading)/components/Overview/SearchBar.tsx
104:6  Warning: React Hook useEffect has a missing dependency: 'mockResults'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
207:45  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
207:53  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities

./app/(trading)/components/Overview/hooks/useOverviewSSE.ts
106:6  Warning: React Hook useEffect has missing dependencies: 'connect' and 'eventSource'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
115:6  Warning: React Hook useEffect has a missing dependency: 'eventSource'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./app/[mode]/not-found.tsx
17:26  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
17:45  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./app/ai/suggestions/page.tsx
159:58  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./app/click-demo/page.tsx
138:56  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./app/compare/page.tsx
22:6  Warning: React Hook useEffect has a missing dependency: 'symbols'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
22:7  Warning: React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked.  react-hooks/exhaustive-deps

./app/components/Navigation.tsx
265:49  Warning: Elements with the ARIA role "combobox" must have the following attributes defined: aria-controls,aria-expanded  jsx-a11y/role-has-required-aria-props

./app/dashboard/page.tsx
122:6  Warning: React Hook useCallback has a missing dependency: 'fetchJSON'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
179:6  Warning: React Hook useCallback has a missing dependency: 'fetchJSON'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./app/history/page.tsx
88:9  Warning: The 'allTrades' logical expression could make the dependencies of useMemo Hook (at line 106) change on every render. To fix this, wrap the initialization of 'allTrades' in its own useMemo() Hook.  react-hooks/exhaustive-deps

./app/screener/page.tsx
345:7  Warning: The attribute aria-sort is not supported by the role button. This role is implicit on the element button.  jsx-a11y/role-supports-aria-props

./app/search/page.tsx
237:37  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
237:45  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities

./app/search-animated/page.tsx
138:36  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
138:44  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
266:58  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./app/trading/components/AdvancedChart.tsx
73:6  Warning: React Hook useEffect has a missing dependency: 'executeAutoTrade'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./app/trading/onboarding/page.tsx
46:27  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
86:22  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./lib/toast/ToastService.ts
70:27  Error: Parsing error: '>' expected.

./src/app/portfolio/page.tsx
30:118  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/app/warrior-demo/page.tsx
147:40  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/AdvisorChat.tsx
80:136  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/ChartPanel.tsx
55:85  Warning: React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/CommandPalette.tsx
200:6  Warning: React Hook useEffect has a missing dependency: 'pushHistory'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/SearchSymbol.tsx
25:6  Warning: React Hook useEffect has a missing dependency: 'setSelectedIdx'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/__tests__/AnimatedNavbar.test.tsx
20:10  Error: Component definition is missing display name  react/display-name

./src/components/middleware/PerformanceMetrics.tsx
160:19  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
160:25  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities

./src/components/search/AnimatedSearchBar.tsx
139:24  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
139:28  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities

./src/components/search/SearchFilters.tsx
81:71  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/hooks/useDynamicRNN.ts
193:6  Warning: React Hook useMemo has a missing dependency: 'config'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/lib/lib/charts/adapters/lightweight.ts
19:21  Error: React Hook "useChartHandlers" cannot be called in a class component. React Hooks must be called in a React function component or a custom React Hook function.  react-hooks/rules-of-hooks

./src/lib/lib/core/eventBus.ts
310:18  Warning: React Hook useEffect has a spread element in its dependency array. This means we can't statically verify whether you've passed the correct dependencies.  react-hooks/exhaustive-deps
326:6  Warning: React Hook useEffect was passed a dependency list that is not an array literal. This means we can't statically verify whether you've passed the correct dependencies.  react-hooks/exhaustive-deps

./src/lib/lib/hooks/useChartHandlers.ts
40:24  Warning: React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead.  react-hooks/exhaustive-deps
59:29  Warning: React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead.  react-hooks/exhaustive-deps
76:27  Warning: React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules

```
