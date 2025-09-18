'use client';
import { useMemo } from 'react';
import { makeRNN } from '@/lib/ai/dynamic-rnn';

export function useDynamicRNN() {
  // Config minimale: features = [don, mom, rsi, senti, macroGrowth, inflΔ]
  const rnn = useMemo(() => makeRNN({ 
    inSize: 6, 
    hidden: 16, 
    spatial: 8, 
    horizon: 64, 
    alpha: 0.12 
  }), []);
  
  function score(sequence: number[][]) {
    // normalisation simple par feature (remplace par tes scalers)
    const seq = sequence.map(v => [
      clamp01(v[0]), 
      clamp01(v[1] / 0.2), 
      v[2] < 40 ? 1 : 0, 
      (v[3] + 1) / 2, 
      Math.max(0, Math.min(1, v[4])), 
      Math.max(0, 1 - Math.max(0, v[5]))
    ]);
    return rnn.predict(seq).roi;
  }
  return { score };
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
