export type Gene = { hold: number; stop: number; take: number; risk: number };
export type Fitness = { sharpe: number; mdd: number; hitrate: number; turnover: number };
export type EvalFn = (g: Gene) => Promise<Fitness>;

function rnd(a: number, b: number) { return a + Math.random() * (b - a); }
function clamp(x: number, a: number, b: number) { return Math.max(a, Math.min(b, x)); }

export async function runGA(evalFn: EvalFn, popSize = 24, gens = 12) {
  let pop: Gene[] = Array.from({ length: popSize }, () => ({ 
    hold: Math.round(rnd(3, 12)), 
    stop: rnd(0.01, 0.06), 
    take: rnd(0.02, 0.12), 
    risk: rnd(0.2, 1.0) 
  }));
  let hall: { gene: Gene; fit: Fitness; score: number }[] = [];
  const score = (f: Fitness) => f.sharpe * 2 - (f.mdd * 10) + f.hitrate - f.turnover * 0.2; // pondération simple
  
  for (let g = 0; g < gens; g++) {
    const fits = await Promise.all(pop.map(evalFn));
    const ranked = pop.map((gene, i) => ({ 
      gene, 
      fit: fits[i], 
      score: score(fits[i]) 
    })).sort((a, b) => b.score - a.score);
    
    hall = [...hall, ranked[0]].sort((a, b) => b.score - a.score).slice(0, 5);
    
    // sélection élitiste + crossover + mutation
    const next: Gene[] = [ranked[0].gene, ranked[1].gene];
    while (next.length < popSize) {
      const a = ranked[Math.floor(Math.random() * 8)].gene;
      const b = ranked[Math.floor(Math.random() * 8)].gene;
      const child: Gene = {
        hold: Math.round((a.hold + b.hold) / 2 + rnd(-1, 1)),
        stop: clamp((a.stop + b.stop) / 2 + rnd(-0.005, 0.005), 0.005, 0.08),
        take: clamp((a.take + b.take) / 2 + rnd(-0.01, 0.01), 0.01, 0.2),
        risk: clamp((a.risk + b.risk) / 2 + rnd(-0.1, 0.1), 0.1, 1.5),
      };
      next.push(child);
    }
    pop = next;
  }
  return hall[0];
}
