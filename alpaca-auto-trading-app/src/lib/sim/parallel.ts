export type ParallelConfig = { 
  paths: number; 
  horizonDays: number; 
  drift: number; 
  vol: number; 
  jumpProb: number; 
  jumpScale: number 
};

export function simulateUniverses(S0: number, cfg: ParallelConfig) {
  const out: number[][] = [];
  for (let p = 0; p < cfg.paths; p++) {
    let S = S0; 
    const path = [S];
    for (let d = 0; d < cfg.horizonDays; d++) {
      const eps = (Math.random() * 2 - 1); // bruit simple
      const jump = Math.random() < cfg.jumpProb ? (1 + (Math.random() * 2 - 1) * cfg.jumpScale) : 1;
      S = S * (1 + cfg.drift + cfg.vol * eps) * jump;
      path.push(S);
    }
    out.push(path);
  }
  return out;
}
