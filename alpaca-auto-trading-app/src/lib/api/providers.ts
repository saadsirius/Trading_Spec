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
