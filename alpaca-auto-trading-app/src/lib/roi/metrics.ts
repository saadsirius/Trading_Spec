function stats(arr: number[]) { 
  const m = arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length); 
  const v = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / Math.max(1, arr.length); 
  return { mean: m, std: Math.sqrt(v) }; 
}

export function returnsFromPrices(px: number[]) { 
  return px.slice(1).map((v, i) => (v - px[i]) / Math.max(1e-9, px[i])); 
}

export function sharpe(returns: number[], rf = 0) { 
  const { mean, std } = stats(returns); 
  return std ? (mean - rf) / std : 0; 
}

export function sortino(returns: number[], rf = 0) { 
  const neg = returns.filter(r => r < 0); 
  const dn = stats(neg).std || 0; 
  const mu = stats(returns).mean; 
  return dn ? (mu - rf) / dn : 0; 
}

export function calmar(returns: number[]) { // approximation via MDD sur equity curve
  let peak = 0, mdd = 0, eq = 0; 
  for (const r of returns) { 
    eq += r; 
    peak = Math.max(peak, eq); 
    mdd = Math.max(mdd, peak - eq); 
  }
  const mu = stats(returns).mean * 252; 
  const dd = mdd || 1e-9; 
  return mu / Math.max(dd, 1e-6);
}

export function var95(returns: number[]) { 
  const s = [...returns].sort((a, b) => a - b); 
  const i = Math.floor(0.05 * s.length); 
  return s[i] ?? 0; 
}

export function sensitivity(features: Record<string, number>, predict: (f: any) => number) {
  const base = predict(features); 
  const out: Record<string, number> = {};
  for (const k of Object.keys(features)) { 
    const f = { ...features }; 
    const delta = 0.05 * Math.max(1, Math.abs(f[k])); 
    f[k] += delta; 
    out[k] = (predict(f) - base) / (delta || 1e-9); 
  }
  return { base, grad: out };
}

// Causal stub: Granger-like score par corrélation décalée (simple, interprétable)
export function causalScore(a: number[], b: number[], lag = 5) {
  if (a.length <= lag || b.length <= lag) return 0;
  const ax = a.slice(lag), bx = b.slice(0, a.length - lag);
  const ma = stats(ax).mean, mb = stats(bx).mean;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < ax.length; i++) { 
    const xa = ax[i] - ma, xb = bx[i] - mb; 
    num += xa * xb; 
    da += xa * xa; 
    db += xb * xb; 
  }
  const r = num / Math.max(1e-9, Math.sqrt(da * db));
  return Math.max(0, (r + 1) / 2); // [0..1]
}
