import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/core/db";

// Donchian breakout simple: high/low N jours
async function donchian(symbol: string, lookback = 20): Promise<"breakout_up"|"breakout_down"|"neutral"> {
  // Simple prix via Finnhub (ou Polygon si tu préfères)
  const finnhubKey = process.env.FINNHUB_API_KEY || "";
  if (!finnhubKey) return "neutral";
  const to = Math.floor(Date.now()/1000);
  const from = to - 90*24*3600;
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${finnhubKey}`;
  const { data } = await axios.get(url);
  if (data?.s !== "ok" || !data?.c) return "neutral";
  const closes: number[] = data.c;
  if (closes.length < lookback+1) return "neutral";
  const last = closes[closes.length-1];
  const window = closes.slice(-lookback-1, -1);
  const high = Math.max(...window);
  const low  = Math.min(...window);
  if (last > high) return "breakout_up";
  if (last < low)  return "breakout_down";
  return "neutral";
}

// Volatilité (écart-type 30j)
function stdev(arr: number[]) {
  const m = arr.reduce((a,b)=>a+b,0)/arr.length;
  const v = arr.reduce((a,b)=>a+(b-m)*(b-m),0)/arr.length;
  return Math.sqrt(v);
}
async function volatilitySpike(symbol: string, thr = 1.5): Promise<boolean> {
  const finnhubKey = process.env.FINNHUB_API_KEY || "";
  if (!finnhubKey) return false;
  const to = Math.floor(Date.now()/1000);
  const from = to - 120*24*3600;
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${finnhubKey}`;
  const { data } = await axios.get(url);
  if (data?.s !== "ok" || !data?.c) return false;
  const c: number[] = data.c;
  if (c.length < 91) return false;
  const last30 = c.slice(-30);
  const prev60 = c.slice(-90,-30);
  const v1 = stdev(last30);
  const v0 = stdev(prev60);
  if (v0 === 0) return false;
  return v1/v0 >= thr;
}

export async function POST() {
  try {
    const rules = await prisma.alertRule.findMany({ where: { active: true } });
    const fired: any[] = [];

    for (const r of rules) {
      const params = JSON.parse(r.paramsJson || "{}");
      if (r.type === "donchian") {
        const res = await donchian(r.symbol, params.lookback ?? 20);
        if (res === "breakout_up" || res === "breakout_down") {
          fired.push({ id: r.id, symbol: r.symbol, type: r.type, event: res });
          await prisma.alertRule.update({ where: { id: r.id }, data: { lastFiredAt: new Date() } });
        }
      } else if (r.type === "volatility") {
        const spike = await volatilitySpike(r.symbol, params.threshold ?? 1.5);
        if (spike) {
          fired.push({ id: r.id, symbol: r.symbol, type: r.type, event: "vol_spike" });
          await prisma.alertRule.update({ where: { id: r.id }, data: { lastFiredAt: new Date() } });
        }
      }
      // TODO: "sentiment", "adx" peuvent être ajoutés ici.
    }

    return NextResponse.json({ ok: true, fired });
  } catch (e) {
    console.error("alerts eval error", e);
    return NextResponse.json({ error: "alerts_eval_failed" }, { status: 500 });
  }
}

export const GET = POST; // permet /api/alerts/eval en GET (cron ping)
