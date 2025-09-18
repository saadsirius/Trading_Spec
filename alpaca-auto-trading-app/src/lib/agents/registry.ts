import { prisma } from '@/lib/db/prisma';

export type Obs = { symbol: string; bars: any[]; newsScore?: number; macro?: Record<string, number> };
export type AgentOutput = { score: number; reasons: string[]; features: Record<string, number> };

export interface Agent { 
  name: string; 
  run: (o: Obs) => Promise<AgentOutput>; 
}

function rsi14(closes: number[]) {
  if (closes.length < 15) return 50;
  let g = 0, l = 0; 
  for (let i = closes.length - 15; i < closes.length - 1; i++) { 
    const d = closes[i + 1] - closes[i]; 
    if (d >= 0) g += d; else l -= d; 
  }
  const rs = g / Math.max(1e-6, l); 
  return 100 - 100 / (1 + rs);
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const techAgent: Agent = {
  name: 'tech',
  async run(o) {
    const c = o.bars.map((b: any) => b.c), 
          h = o.bars.map((b: any) => b.h), 
          l = o.bars.map((b: any) => b.l);
    const last = c.at(-1) ?? 0;
    const sma20 = c.slice(-20).reduce((a, b) => a + b, 0) / Math.max(1, c.slice(-20).length);
    const mom = (last - sma20) / Math.max(1e-9, sma20);
    const don = last >= Math.max(...h.slice(-20)) ? 1 : 0;
    const rsi = rsi14(c);
    const score = clamp01(0.45 * don + 0.35 * clamp01(mom / 0.2) + 0.2 * (rsi < 40 ? 1 : 0));
    return { 
      score, 
      reasons: [don ? 'Breakout Donchian' : '', mom > 0 ? 'Momentum>0' : '', rsi < 40 ? 'RSI bas' : ''].filter(Boolean), 
      features: { don: Number(don), mom, rsi } 
    };
  }
};

export const sentimentAgent: Agent = {
  name: 'sentiment',
  async run(o) {
    // newsScore ∈ [-1..+1]  → map sur [0..1]
    const s = o.newsScore ?? 0;
    const score = clamp01(0.5 + 0.5 * s);
    return { 
      score, 
      reasons: [`Sentiment ${(s * 100).toFixed(0)}‰`], 
      features: { senti: s } 
    };
  }
};

export const macroAgent: Agent = {
  name: 'macro',
  async run(o) {
    const m = o.macro || {};
    // Exemple : prime si croissance > tendance et inflation en baisse
    const growth = Number(m.growthNow ?? 0);
    const inflChg = Number(m.inflationChange ?? 0); // négatif = bien
    const s = clamp01(0.5 + 0.6 * growth - 0.4 * Math.max(0, inflChg));
    return { 
      score: s, 
      reasons: [`Macro: growth=${growth}, ΔCPI=${inflChg}`], 
      features: { growth, inflChg } 
    };
  }
};

export async function runAgents(userEmail: string, obs: Obs, weights = { tech: 0.6, sentiment: 0.2, macro: 0.2 }) {
  const outs = await Promise.all([techAgent.run(obs), sentimentAgent.run(obs), macroAgent.run(obs)]);
  const [t, s, m] = outs;
  const fused = clamp01(weights.tech * t.score + weights.sentiment * s.score + weights.macro * m.score);
  await prisma.agent_run.create({ 
    data: { 
      userEmail, 
      agent: 'fusion', 
      inputJson: obs as any, 
      outputJson: { t, s, m, fused } 
    }
  });
  return { fused, parts: { t, s, m } };
}
