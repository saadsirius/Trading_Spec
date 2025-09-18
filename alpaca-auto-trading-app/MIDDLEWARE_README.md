# Middleware Découplé System

## Overview

This system provides a comprehensive middleware architecture with API Gateway, Queues, Cache, SSE, GraphQL, and Security features for the Alpaca Trading App.

## Architecture

### Core Components

1. **API Gateway** (`/api/gw/[...path]`) - Unified routing with authentication and throttling
2. **Redis Cache** - Distributed caching with JSON helpers
3. **Rate Limiting** - Sliding window rate limiting
4. **Queue System** - BullMQ for AI and backtest jobs
5. **Plugin Architecture** - Extensible provider system
6. **SSE Streaming** - Real-time price updates
7. **GraphQL Endpoint** - Targeted queries for market data
8. **Webhook Security** - HMAC verification

### Search System

1. **Search Engine** - Alpaca-first search with scoring
2. **Enrichment** - Company data and ESG scores
3. **Autocomplete** - Real-time suggestions
4. **Filters** - Advanced filtering capabilities
5. **History** - Search history tracking

## API Endpoints

### Gateway Routes
- `GET /api/gw/alpaca/market/bars` - Market data with caching
- `POST /api/gw/alpaca/orders` - Order management
- `POST /api/gw/ai/advisor` - AI job processing

### Search APIs
- `GET /api/search?q=AAPL` - Search symbols
- `GET /api/search/suggest?q=AAP` - Autocomplete suggestions

### Streaming
- `GET /api/stream/sse?symbols=SPY,QQQ` - Real-time price updates

### GraphQL
- `POST /api/graphql` - GraphQL queries for market data

### Health & Monitoring
- `GET /api/health` - System health status
- `GET /api/gw/list` - Active plugins list

## Usage Examples

### Search for Symbols
```bash
curl "http://localhost:3000/api/search?q=AAPL"
```

### Get Real-time Prices
```bash
curl "http://localhost:3000/api/stream/sse?symbols=SPY,QQQ,NVDA"
```

### GraphQL Query
```graphql
query {
  quote(symbol: "AAPL") {
    symbol
    price
    change1d
    change1w
    change1m
  }
}
```

### Gateway Market Data
```bash
curl "http://localhost:3000/api/gw/alpaca/market/bars?symbols=SPY,QQQ&timeframe=1Day&limit=100"
```

## Configuration

### Environment Variables
```env
# Redis
REDIS_URL=redis://localhost:6379

# Rate Limiting
GATEWAY_RATE_QPS=10

# Webhook Security
SHARED_WEBHOOK_SECRET=change-me

# Logging
LOG_LEVEL=info
```

### Dependencies
- `zod` - Schema validation
- `pino` - Logging
- `nanoid` - Request ID generation
- `ioredis` - Redis client
- `bullmq` - Queue management
- `graphql` - GraphQL support
- `@graphql-yoga/node` - GraphQL server
- `swr` - Data fetching

## Features

### Search System
- **TradingView-like Search** - Fast symbol search with autocomplete
- **Enriched Data** - Company logos, ESG scores, financial metrics
- **Advanced Filters** - Price, volume, change, ESG filtering
- **Search History** - Persistent search history
- **Real-time Updates** - Live price updates via SSE

### Middleware
- **Plugin Architecture** - Extensible provider system
- **Rate Limiting** - Configurable QPS limits
- **Caching** - Redis-based distributed cache
- **Queue Processing** - Asynchronous job processing
- **Health Monitoring** - System status dashboard

### Security
- **HMAC Verification** - Webhook signature validation
- **Rate Limiting** - DDoS protection
- **Input Validation** - Zod schema validation
- **Request Tracking** - Unique request IDs

## Development

### Adding New Plugins
```typescript
import { register } from '@/src/plugins';

const myProvider = {
  id: 'my-provider',
  handles: (path) => path.startsWith('/my-endpoint'),
  async exec(req) {
    // Handle request
    return new Response(JSON.stringify({ data: 'example' }));
  }
};

register(myProvider);
```

### Custom Search Providers
```typescript
// Add to src/lib/search/providers/
export async function mySearchProvider(query: string) {
  // Custom search logic
  return results;
}
```

## Monitoring

### Health Check
Visit `/api/health` to check system status:
- Redis connectivity
- Cache functionality
- Environment configuration

### Status Dashboard
Visit `/lab/middleware` for real-time monitoring:
- System health
- Active plugins
- SSE connection status
- Recent price updates

## Performance

### Caching Strategy
- Market data: 60s TTL
- Search results: LRU cache (200 items)
- Rate limiting: 10s sliding window

### Rate Limits
- Default: 10 QPS per IP
- Configurable via `GATEWAY_RATE_QPS`

### Queue Processing
- AI jobs: 3 attempts with exponential backoff
- Backtest jobs: 2 attempts with fixed delay
- Workers run in development mode

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check `REDIS_URL` environment variable
   - Ensure Redis server is running

2. **Rate Limit Exceeded**
   - Increase `GATEWAY_RATE_QPS` or implement client-side throttling

3. **Search Returns Empty Results**
   - Verify Alpaca API keys are configured
   - Check network connectivity

4. **SSE Connection Issues**
   - Verify symbols parameter format
   - Check browser console for errors

### Debug Mode
Set `LOG_LEVEL=debug` for detailed logging.

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Advanced caching strategies
- [ ] Metrics collection (Prometheus)
- [ ] Distributed tracing
- [ ] Auto-scaling queue workers
- [ ] Multi-region support
