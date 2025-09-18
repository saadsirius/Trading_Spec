import express from 'express';
import prom from 'prom-client';
import { log } from '../lib/logger';

const app = express();
const register = new prom.Registry();

// Collect default metrics
prom.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new prom.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const alpacaApiCalls = new prom.Counter({
  name: 'alpaca_api_calls_total',
  help: 'Total number of Alpaca API calls',
  labelNames: ['endpoint', 'status']
});

const tradeVolume = new prom.Counter({
  name: 'trade_volume_total',
  help: 'Total trade volume in USD',
  labelNames: ['symbol', 'side']
});

const portfolioValue = new prom.Gauge({
  name: 'portfolio_value_usd',
  help: 'Current portfolio value in USD'
});

const positionCount = new prom.Gauge({
  name: 'positions_count',
  help: 'Number of open positions'
});

const factorScore = new prom.Gauge({
  name: 'factor_score',
  help: 'Factor score for a symbol',
  labelNames: ['symbol', 'factor']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(alpacaApiCalls);
register.registerMetric(tradeVolume);
register.registerMetric(portfolioValue);
register.registerMetric(positionCount);
register.registerMetric(factorScore);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    log.error('Error generating metrics', { error });
    res.status(500).end('Error generating metrics');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const port = process.env.METRICS_PORT || 9300;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    log.info(`📈 Metrics server running on port ${port}`);
    log.info(`📊 Metrics endpoint: http://localhost:${port}/metrics`);
    log.info(`🏥 Health check: http://localhost:${port}/health`);
  });
}

export {
  httpRequestDuration,
  httpRequestTotal,
  alpacaApiCalls,
  tradeVolume,
  portfolioValue,
  positionCount,
  factorScore,
  register
};