/** RNN dynamique "DG-RNN": cellules temporelles + interactions spatiales entre features.
 *  Objectif: signal ROI(t) ≈ f( features[t-L..t], états cachés ).
 *  ≠ DeepLearn libs: ce runner est CPU-friendly, parfait pour inference rapide dans UI/lab.
 */
export type RNNConfig = { 
  inSize: number; 
  hidden: number; 
  spatial: number; 
  horizon: number; 
  alpha?: number; 
};

export type RNNState = { 
  h: Float64Array; 
  s: Float64Array; 
}; // h: hidden, s: spatial memory

export function makeRNN(cfg: RNNConfig) {
  const alpha = cfg.alpha ?? 0.15; // taux de fuite
  // Poids init (déterministes pour merge-safe, remplace par seeds si besoin)
  const Wxh = rand(cfg.hidden, cfg.inSize, 0.2), 
        Whh = rand(cfg.hidden, cfg.hidden, 0.1);
  const Wsh = rand(cfg.spatial, cfg.hidden, 0.12), 
        Wss = rand(cfg.spatial, cfg.spatial, 0.05);
  const Why = rand(1, cfg.hidden + cfg.spatial, 0.25);
  const bh = new Float64Array(cfg.hidden).fill(0);
  const by = new Float64Array(1).fill(0);

  function step(x: Float64Array, st: RNNState): RNNState {
    // h_t = tanh(Wxh x + Whh h_{t-1} + b)
    const h_new = addVec(tanh(add(mul(Wxh, x), add(mul(Whh, st.h), bh))), st.h, alpha);
    // s_t = relu(Wsh h_t + Wss s_{t-1})
    const s_new = relu(add(mul(Wsh, h_new), mul(Wss, st.s)));
    return { h: h_new, s: s_new };
  }

  function predict(xSeq: number[][]) {
    let st: RNNState = { 
      h: new Float64Array(cfg.hidden), 
      s: new Float64Array(cfg.spatial) 
    };
    for (const x of xSeq) { 
      st = step(Float64Array.from(x), st); 
    }
    const y = dot(Why, concat(st.h, st.s))[0] + by[0];
    // mapping → ROI score [-1..+1] puis clamp [0..1]
    const roi = Math.max(0, Math.min(1, 0.5 + 0.5 * Math.tanh(y)));
    return { roi, state: st };
  }
  return { predict };
}

// --- helpers ---
function rand(r: number, c: number, scale: number) { 
  const W = new Array(r).fill(0).map(() => new Float64Array(c)); 
  let k = 1; 
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) { 
      k = (1103515245 * k + 12345) % 2 ** 31; 
      W[i][j] = scale * ((k / 2 ** 31) - 0.5) * 2; 
    } 
  } 
  return W; 
}

function mul(W: Float64Array[], x: Float64Array) { 
  const y = new Float64Array(W.length); 
  for (let i = 0; i < W.length; i++) { 
    let s = 0; 
    for (let j = 0; j < x.length; j++) s += W[i][j] * x[j]; 
    y[i] = s; 
  } 
  return y; 
}

function add(a: Float64Array, b: Float64Array) { 
  const y = new Float64Array(a.length); 
  for (let i = 0; i < a.length; i++) y[i] = a[i] + b[i]; 
  return y; 
}

function addVec(a: Float64Array, b: Float64Array, alpha: number) { 
  const y = new Float64Array(a.length); 
  for (let i = 0; i < a.length; i++) y[i] = (1 - alpha) * a[i] + alpha * b[i]; 
  return y; 
}

function tanh(a: Float64Array) { 
  const y = new Float64Array(a.length); 
  for (let i = 0; i < a.length; i++) y[i] = Math.tanh(a[i]); 
  return y; 
}

function relu(a: Float64Array) { 
  const y = new Float64Array(a.length); 
  for (let i = 0; i < a.length; i++) y[i] = Math.max(0, a[i]); 
  return y; 
}

function concat(a: Float64Array, b: Float64Array) { 
  const y = new Float64Array(a.length + b.length); 
  y.set(a, 0); 
  y.set(b, a.length); 
  return y; 
}

function dot(W: Float64Array[], x: Float64Array) { 
  const y = new Float64Array(W.length); 
  for (let i = 0; i < W.length; i++) { 
    let s = 0; 
    for (let j = 0; j < x.length; j++) s += W[i][j] * x[j]; 
    y[i] = s; 
  } 
  return y; 
}
