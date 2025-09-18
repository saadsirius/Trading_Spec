import vader from 'vader-sentiment';
import type { NewsItem } from '@/src/types/market';

export function scoreText(text: string): number {
  if (!text) return 0;
  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  // compound déjà -1..+1
  return Math.max(-1, Math.min(1, intensity.compound));
}

export function enrichSentiment(item: NewsItem): NewsItem {
  if (typeof item.sentiment === 'number') return item;
  const base = `${item.headline} ${item.summary||''}`;
  return { ...item, sentiment: scoreText(base) };
}

// simple provider mapping fallback (si pas de VADER dispo côté edge)
export function providerBias(source: string): number {
  const s = source.toLowerCase();
  if (s.includes('seekingalpha')) return 0.05;
  if (s.includes('wsj')) return 0.02;
  return 0;
}
