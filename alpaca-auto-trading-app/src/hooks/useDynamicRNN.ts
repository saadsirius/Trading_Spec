/**
 * File: src/hooks/useDynamicRNN.ts
 * Description: Dynamic RNN hook for financial sequence analysis and ROI scoring.
 */
'use client';

import { useMemo, useRef, useCallback } from 'react';

type Sample = [don: number, momentum: number, rsi: number, sentiment: number, growth: number, deltaCPI: number];
type Seq = Sample[];

interface RNNState {
  hidden: number[];
  cell: number[];
}

interface RNNConfig {
  hiddenSize: number;
  learningRate: number;
  sequenceLength: number;
}

class DynamicRNN {
  private config: RNNConfig;
  private weights: {
    input: number[][];
    hidden: number[][];
    output: number[][];
    bias: number[];
  };
  private state: RNNState;

  constructor(config: Partial<RNNConfig> = {}) {
    this.config = {
      hiddenSize: 32,
      learningRate: 0.01,
      sequenceLength: 64,
      ...config,
    };

    this.weights = this.initializeWeights();
    this.state = this.initializeState();
  }

  private initializeWeights() {
    const { hiddenSize } = this.config;
    const inputSize = 6; // don, momentum, rsi, sentiment, growth, deltaCPI
    const outputSize = 1; // ROI score

    return {
      input: this.randomMatrix(inputSize, hiddenSize),
      hidden: this.randomMatrix(hiddenSize, hiddenSize),
      output: this.randomMatrix(hiddenSize, outputSize),
      bias: this.randomVector(hiddenSize),
    };
  }

  private initializeState(): RNNState {
    return {
      hidden: new Array(this.config.hiddenSize).fill(0),
      cell: new Array(this.config.hiddenSize).fill(0),
    };
  }

  private randomMatrix(rows: number, cols: number): number[][] {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.1)
    );
  }

  private randomVector(size: number): number[] {
    return Array.from({ length: size }, () => (Math.random() - 0.5) * 0.1);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private tanh(x: number): number {
    return Math.tanh(x);
  }

  private forward(input: Sample): number {
    const { hiddenSize } = this.config;
    const newHidden = new Array(hiddenSize).fill(0);
    const newCell = new Array(hiddenSize).fill(0);

    // LSTM-like computation (simplified)
    for (let i = 0; i < hiddenSize; i++) {
      // Input gate
      let inputGate = 0;
      for (let j = 0; j < 6; j++) {
        inputGate += input[j] * this.weights.input[j][i];
      }
      for (let j = 0; j < hiddenSize; j++) {
        inputGate += this.state.hidden[j] * this.weights.hidden[j][i];
      }
      inputGate = this.sigmoid(inputGate + this.weights.bias[i]);

      // Forget gate
      let forgetGate = 0;
      for (let j = 0; j < 6; j++) {
        forgetGate += input[j] * this.weights.input[j][i];
      }
      for (let j = 0; j < hiddenSize; j++) {
        forgetGate += this.state.hidden[j] * this.weights.hidden[j][i];
      }
      forgetGate = this.sigmoid(forgetGate + this.weights.bias[i]);

      // Cell state
      let cellInput = 0;
      for (let j = 0; j < 6; j++) {
        cellInput += input[j] * this.weights.input[j][i];
      }
      for (let j = 0; j < hiddenSize; j++) {
        cellInput += this.state.hidden[j] * this.weights.hidden[j][i];
      }
      cellInput = this.tanh(cellInput + this.weights.bias[i]);

      newCell[i] = forgetGate * this.state.cell[i] + inputGate * cellInput;

      // Output gate
      let outputGate = 0;
      for (let j = 0; j < 6; j++) {
        outputGate += input[j] * this.weights.input[j][i];
      }
      for (let j = 0; j < hiddenSize; j++) {
        outputGate += this.state.hidden[j] * this.weights.hidden[j][i];
      }
      outputGate = this.sigmoid(outputGate + this.weights.bias[i]);

      newHidden[i] = outputGate * this.tanh(newCell[i]);
    }

    this.state.hidden = newHidden;
    this.state.cell = newCell;

    // Output layer
    let output = 0;
    for (let i = 0; i < hiddenSize; i++) {
      output += this.state.hidden[i] * this.weights.output[i][0];
    }

    return this.sigmoid(output);
  }

  public score(sequence: Seq): number {
    if (!sequence.length) return 0;

    // Reset state
    this.state = this.initializeState();

    // Process sequence
    let totalScore = 0;
    for (const sample of sequence) {
      const score = this.forward(sample);
      totalScore += score;
    }

    // Normalize and return average score
    return totalScore / sequence.length;
  }

  public updateWeights(sequence: Seq, target: number) {
    // Simplified gradient descent update
    const prediction = this.score(sequence);
    const error = target - prediction;

    // Update weights based on error (simplified)
    const { learningRate } = this.config;
    for (let i = 0; i < this.weights.output.length; i++) {
      this.weights.output[i][0] += learningRate * error * this.state.hidden[i];
    }
  }

  public getState(): RNNState {
    return { ...this.state };
  }

  public getConfig(): RNNConfig {
    return { ...this.config };
  }
}

export function useDynamicRNN(config?: Partial<RNNConfig>) {
  const rnnRef = useRef<DynamicRNN | null>(null);

  const rnn = useMemo(() => {
    if (!rnnRef.current) {
      rnnRef.current = new DynamicRNN(config);
    }
    return rnnRef.current;
  }, [config?.hiddenSize, config?.learningRate, config?.sequenceLength]);

  const score = useCallback((sequence: Seq) => {
    return rnn.score(sequence);
  }, [rnn]);

  const update = useCallback((sequence: Seq, target: number) => {
    rnn.updateWeights(sequence, target);
  }, [rnn]);

  const getState = useCallback(() => {
    return rnn.getState();
  }, [rnn]);

  const getConfig = useCallback(() => {
    return rnn.getConfig();
  }, [rnn]);

  return {
    score,
    update,
    getState,
    getConfig,
  };
}

export type { Sample, Seq, RNNConfig, RNNState };