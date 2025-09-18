export type Rule = { 
  id: string; 
  title: string; 
  weight: number; 
  when: (f: any) => boolean; 
  contrib: (f: any) => number 
};

export type HybridScore = { 
  score: number; 
  rulesFired: { id: string; title: string; w: number; val: number }[]; 
  nn: { w: number[]; x: number[]; y: number } 
};

export function buildDefaultRules(): Rule[] {
  return [
    { 
      id: 'don20', 
      title: 'Breakout Donchian 20', 
      weight: 0.5, 
      when: (f: any) => f.don === 1, 
      contrib: () => 1 
    },
    { 
      id: 'momPos', 
      title: 'Momentum positif', 
      weight: 0.3, 
      when: (f: any) => f.mom > 0, 
      contrib: (f: any) => Math.min(1, f.mom / 0.2) 
    },
    { 
      id: 'rsiLow', 
      title: 'RSI < 40 (contrarian)', 
      weight: 0.2, 
      when: (f: any) => f.rsi < 40, 
      contrib: () => 1 
    },
  ];
}

export function hybridScore(features: { don: number; mom: number; rsi: number }, nnW = [0.45, 0.35, 0.2]): HybridScore {
  const rules = buildDefaultRules();
  const fired = rules.filter(r => r.when(features)).map(r => ({ 
    id: r.id, 
    title: r.title, 
    w: r.weight, 
    val: r.contrib(features) 
  }));
  const rulesScore = fired.reduce((s, r) => s + r.w * r.val, 0);
  const x = [features.don, Math.max(0, Math.min(1, features.mom / 0.2)), features.rsi < 40 ? 1 : 0];
  const y = Math.max(0, Math.min(1, nnW[0] * x[0] + nnW[1] * x[1] + nnW[2] * x[2]));
  const score = Math.max(0, Math.min(1, 0.6 * rulesScore + 0.4 * y));
  return { score, rulesFired: fired, nn: { w: nnW, x, y } };
}
