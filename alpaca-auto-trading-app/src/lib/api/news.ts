import axios from "axios";
import NodeCache from "node-cache";
import { prisma } from "../core/db";

const polygonKey = process.env.POLYGON_API_KEY || "";
const finnhubKey = process.env.FINNHUB_API_KEY || "";
const newsapiKey = process.env.NEWSAPI_KEY || "";

const cache = new NodeCache({ stdTTL: 60 }); // 1 minute

type NewsItem = {
  source: "polygon" | "finnhub" | "newsapi";
  symbol?: string;
  title: string;
  url: string;
  publishedAt: string;
  sentiment?: number; // -1..+1
  raw: any;
};

function simpleSentiment(text: string): number {
  // Mini modèle très simple (lexique minuscule + normalisation)
  const pos = ["beat", "surge", "record", "growth", "upgrade", "strong", "bullish", "outperform"];
  const neg = ["miss", "drop", "lawsuit", "downgrade", "weak", "bearish", "fraud", "probe"];
  const t = text.toLowerCase();
  let score = 0;
  pos.forEach(w => { if (t.includes(w)) score += 1; });
  neg.forEach(w => { if (t.includes(w)) score -= 1; });
  return Math.max(-1, Math.min(1, score / 3));
}

export async function fetchNews(symbol?: string): Promise<NewsItem[]> {
  const key = `news:${symbol || "all"}`;
  const cached = cache.get<NewsItem[]>(key);
  if (cached) return cached;

  const out: NewsItem[] = [];

  // Polygon
  if (polygonKey) {
    try {
      const url = symbol
        ? `https://api.polygon.io/v2/reference/news?ticker=${encodeURIComponent(symbol)}&limit=20&apiKey=${polygonKey}`
        : `https://api.polygon.io/v2/reference/news?limit=20&apiKey=${polygonKey}`;
      const { data } = await axios.get(url);
      for (const n of data?.results || []) {
        const title = n.title || "";
        out.push({
          source: "polygon",
          symbol,
          title,
          url: n.article_url,
          publishedAt: n.published_utc,
          sentiment: simpleSentiment(title),
          raw: n,
        });
      }
    } catch (e) {
      console.warn("polygon news error", e);
    }
  }

  // Finnhub
  if (finnhubKey) {
    try {
      if (symbol) {
        const from = new Date(Date.now() - 7 * 86400000).toISOString().slice(0,10);
        const to   = new Date().toISOString().slice(0,10);
        const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${finnhubKey}`;
        const { data } = await axios.get(url);
        for (const n of data || []) {
          const title = n.headline || "";
          out.push({
            source: "finnhub",
            symbol,
            title,
            url: n.url,
            publishedAt: new Date(n.datetime * 1000).toISOString(),
            sentiment: simpleSentiment(title),
            raw: n,
          });
        }
      }
    } catch (e) {
      console.warn("finnhub news error", e);
    }
  }

  // NewsAPI (générique)
  if (newsapiKey) {
    try {
      const q = symbol ? encodeURIComponent(symbol) : "stocks";
      const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsapiKey}`;
      const { data } = await axios.get(url);
      for (const n of data?.articles || []) {
        const title = n.title || "";
        out.push({
          source: "newsapi",
          symbol,
          title,
          url: n.url,
          publishedAt: n.publishedAt,
          sentiment: simpleSentiment(title),
          raw: n,
        });
      }
    } catch (e) {
      logger.warn({ err: e }, "newsapi error");
    }
  }

  // Persist en base (async, best effort)
  Promise.allSettled(
    out.map(n =>
      prisma.newsCache.create({
        data: {
          symbol: n.symbol || "",
          source: n.source,
          title: n.title,
          url: n.url,
          published: new Date(n.publishedAt),
          sentiment: n.sentiment ?? null,
          rawJson: JSON.stringify(n.raw || {}),
        },
      })
    )
  ).catch(() => { /* noop */ });

  cache.set(key, out);
  return out;
}