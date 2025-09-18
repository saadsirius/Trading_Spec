import axios from "axios";
import NodeCache from "node-cache";
import { prisma } from "../core/db";
import { logger } from "../core/logger";

const tradKey = process.env.TRAD_ECON_API_KEY || "";
const polygonKey = process.env.POLYGON_API_KEY || "";
const finnhubKey = process.env.FINNHUB_API_KEY || "";

const cache = new NodeCache({ stdTTL: 300 });

type CalItem = {
  type: "macro" | "earnings";
  date: string;
  title: string;
  symbol?: string;
  country?: string;
  impact?: string;
  raw: any;
};

export async function fetchCalendar(symbol?: string): Promise<CalItem[]> {
  const key = `cal:${symbol || "all"}`;
  const cached = cache.get<CalItem[]>(key);
  if (cached) return cached;

  const out: CalItem[] = [];

  // TradingEconomics Macro
  if (tradKey && !symbol) {
    try {
      const url = `https://api.tradingeconomics.com/calendar?importance=2&c=guest:guest&format=json`; 
      // NB: si tu as une clé perso, remplace par ?c=your_key:your_secret
      const { data } = await axios.get(url);
      for (const ev of data || []) {
        out.push({
          type: "macro",
          date: new Date(ev.Date).toISOString(),
          title: ev.Event || ev.Category,
          country: ev.Country,
          impact: ev.Importance,
          raw: ev,
        });
      }
    } catch (e) {
      logger.warn({ err: e }, "tradingeconomics error");
    }
  }

  // Earnings Finnhub
  if (finnhubKey) {
    try {
      const from = new Date().toISOString().slice(0,10);
      const to   = new Date(Date.now() + 14 * 86400000).toISOString().slice(0,10);
      if (symbol) {
        const url = `https://finnhub.io/api/v1/calendar/earnings?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${finnhubKey}`;
        const { data } = await axios.get(url);
        for (const ev of data?.earningsCalendar || []) {
          out.push({
            type: "earnings",
            date: ev?.date,
            title: "Earnings",
            symbol,
            raw: ev,
          });
        }
      } else {
        const url = `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${finnhubKey}`;
        const { data } = await axios.get(url);
        for (const ev of data?.earningsCalendar || []) {
          out.push({
            type: "earnings",
            date: ev?.date,
            title: `${ev?.symbol} Earnings`,
            symbol: ev?.symbol,
            raw: ev,
          });
        }
      }
    } catch (e) {
      logger.warn({ err: e }, "finnhub earnings error");
    }
  }

  // Polygon Ticker news/earnings (fallback simple pour symbol)
  if (polygonKey && symbol) {
    try {
      const url = `https://api.polygon.io/vX/reference/financials?ticker=${encodeURIComponent(symbol)}&limit=1&apiKey=${polygonKey}`;
      await axios.get(url); // placeholder: Polygon earnings endpoints varient selon plan
      // Ici on n'ajoute pas d'items si pas d'API earnings publique stable
    } catch (e) {
      logger.info("polygon earnings fallback skipped");
    }
  }

  // Persist macro en base (best effort)
  Promise.allSettled(
    out.filter(i => i.type === "macro").map(ev =>
      prisma.econEvent.create({
        data: {
          country: ev.country || "",
          title: ev.title,
          date: new Date(ev.date),
          impact: ev.impact || "",
          rawJson: JSON.stringify(ev.raw || {}),
        },
      })
    )
  ).catch(() => {});

  cache.set(key, out);
  return out;
}