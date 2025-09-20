/**
 * File: src/types/vader-sentiment.d.ts
 * Description: Type declarations for vader-sentiment library.
 */
declare module 'vader-sentiment' {
  interface SentimentResult {
    score: number;
    positive: number;
    negative: number;
    neutral: number;
    compound: number;
  }

  function SentimentIntensityAnalyzer(): {
    polarity_scores: (text: string) => SentimentResult;
  };

  export = SentimentIntensityAnalyzer;
}
