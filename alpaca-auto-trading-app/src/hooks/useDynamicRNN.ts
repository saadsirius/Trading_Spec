/**
 * File: src/hooks/useDynamicRNN.ts
 * Description: Dynamic RNN hook for spatio-temporal sequence scoring.
 */
'use client';

import { useCallback, useMemo } from 'react';

type Sample = [don: number, momentum: number, rsi: number, sentiment: number, growth: number, deltaCPI: number];
type Sequence = Sample[];

interface RNNState {
  hidden: number[];
  cell: number[];
}

export function useDynamicRNN() {
  // Simple RNN parameters (would be loaded from a model in production)
  const weights = useMemo(() => ({
    // Input to hidden weights (6 features -> 32 hidden units)
    W_ih: Array.from({ length: 6 * 32 }, () => (Math.random() - 0.5) * 0.1),
    // Hidden to hidden weights (32 -> 32)
    W_hh: Array.from({ length: 32 * 32 }, () => (Math.random() - 0.5) * 0.1),
    // Hidden to output weights (32 -> 1)
    W_ho: Array.from({ length: 32 }, () => (Math.random() - 0.5) * 0.1),
    // Biases
    b_h: Array.from({ length: 32 }, () => 0),
    b_o: 0,
  }), []);

  const sigmoid = useCallback((x: number) => 1 / (1 + Math.exp(-x)), []);
  const tanh = useCallback((x: number) => Math.tanh(x), []);

  const score = useCallback((sequence: Sequence): number => {
    if (sequence.length === 0) return 0;

    // Initialize hidden state
    let hidden = Array.from({ length: 32 }, () => 0);
    let cell = Array.from({ length: 32 }, () => 0);

    // Process sequence
    for (const sample of sequence) {
      const newHidden = Array.from({ length: 32 }, () => 0);
      const newCell = Array.from({ length: 32 }, () => 0);

      for (let h = 0; h < 32; h++) {
        // Input to hidden
        let inputSum = 0;
        for (let i = 0; i < 6; i++) {
          inputSum += sample[i] * weights.W_ih[i * 32 + h];
        }

        // Hidden to hidden
        let hiddenSum = 0;
        for (let h2 = 0; h2 < 32; h2++) {
          hiddenSum += hidden[h2] * weights.W_hh[h2 * 32 + h];
        }

        // LSTM-like gating (simplified)
        const forgetGate = sigmoid(inputSum + hiddenSum + weights.b_h[h]);
        const inputGate = sigmoid(inputSum + hiddenSum + weights.b_h[h] + 0.1);
        const candidate = tanh(inputSum + hiddenSum + weights.b_h[h]);

        newCell[h] = forgetGate * cell[h] + inputGate * candidate;
        newHidden[h] = tanh(newCell[h]);
      }

      hidden = newHidden;
      cell = newCell;
    }

    // Output layer
    let output = weights.b_o;
    for (let h = 0; h < 32; h++) {
      output += hidden[h] * weights.W_ho[h];
    }

    // Normalize to [0, 1] range
    return Math.max(0, Math.min(1, sigmoid(output)));
  }, [weights, sigmoid, tanh]);

  return {
    score,
    // Additional methods for debugging/analysis
    getWeights: () => weights,
    reset: () => {
      // Reset internal state if needed
    },
  };
}