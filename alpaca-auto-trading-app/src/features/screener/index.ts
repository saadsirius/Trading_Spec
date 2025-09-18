/**
 * Screener minimal: filtre et scoring de symboles selon règles & snapshots.
 * Branche-toi sur tes sources (quotes/candles) et renvoie un top-N.
 */
export type ScreenerRow = {
  symbol: string;
  score: number;          // [-1,1]
  reason: string;         // "MA cross + Volume spike"
  tf: string;             // timeframe
  last: number | null;    // dernier prix
  sentiment: number | null; // [-1,1]
};

export type ScreenerQuery = {
  tf: string;
  minVolume?: number;
  universe: string[];     // liste de symboles à évaluer
};

export async function runScreener(q: ScreenerQuery): Promise<ScreenerRow[]> {
  // TODO: branchement data temps réel + règles. Ici: squelette tri aléatoire stable.
  const rows = q.universe.map((s, i) => ({
    symbol: s,
    score: Math.sin(i) / 2,   // placeholder déterministe
    reason: "placeholder",
    tf: q.tf,
    last: null,
    sentiment: null,
  }));
  return rows.sort((a,b)=>b.score-a.score).slice(0, 50);
}
