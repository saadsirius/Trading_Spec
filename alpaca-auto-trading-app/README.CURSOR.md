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
