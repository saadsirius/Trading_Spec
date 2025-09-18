export function lyapunovProxy(series: number[]) {
  // Proxy cheap: moyenne des |Δret| * corrélation signe → + = instable
  if (series.length < 30) return 0;
  const r = series.slice(1).map((v, i) => (v - series[i]) / Math.max(1e-9, series[i]));
  const avg = r.reduce((a, b) => a + Math.abs(b), 0) / r.length;
  const signCorr = r.slice(1).map((v, i) => Math.sign(v) * Math.sign(r[i])).reduce((a, b) => a + b, 0) / Math.max(1, r.length - 1);
  return Math.max(0, Math.min(1, 0.5 * avg * 50 + 0.5 * (1 - signCorr) / 2)); // ~[0..1]
}

export function regimeState(series: number[]) {
  const l = lyapunovProxy(series);
  return l > 0.7 ? 'chaotic' : l > 0.45 ? 'turbulent' : 'calm';
}
