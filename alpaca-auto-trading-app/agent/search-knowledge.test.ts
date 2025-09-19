// agent/search-knowledge.test.ts
import { describe, it, expect } from 'vitest';
import { nearestChunks, searchByText, searchKnowledge } from './search-knowledge';
import { LoadedKnowledge } from './load-knowledge';

const SAMPLE_EMBEDDINGS = [
  { id: "chunk_0", text: "## Services - ClickHandlerService handles buy/sell clicks", embedding: [0.1, 0.2, 0.3] },
  { id: "chunk_1", text: "## Hooks - useAlertHandlers manages alert state", embedding: [0.4, 0.5, 0.6] },
  { id: "chunk_2", text: "## Types - Order interface for trading orders", embedding: [0.7, 0.8, 0.9] }
];

const SAMPLE_CONTEXT: LoadedKnowledge = {
  knowledge: null,
  embeddings: SAMPLE_EMBEDDINGS
};

describe('search-knowledge', () => {
  it('finds nearest chunks by vector similarity', () => {
    const queryEmbedding = [0.1, 0.2, 0.3]; // Should match chunk_0
    const results = nearestChunks(SAMPLE_CONTEXT, queryEmbedding, 2);
    
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe("chunk_0");
    expect(results[0].score).toBeCloseTo(1, 5); // Perfect match
    expect(results[1].score).toBeLessThan(results[0].score);
  });

  it('searches by text content', () => {
    const results = searchByText(SAMPLE_CONTEXT, "ClickHandler", 2);
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("chunk_0");
    expect(results[0].text).toContain("ClickHandlerService");
  });

  it('handles text search with no matches', () => {
    const results = searchByText(SAMPLE_CONTEXT, "nonexistent", 2);
    expect(results).toHaveLength(0);
  });

  it('combined search with vector input', () => {
    const queryEmbedding = [0.4, 0.5, 0.6];
    const results = searchKnowledge(SAMPLE_CONTEXT, queryEmbedding, 1);
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("chunk_1");
  });

  it('combined search with text input', () => {
    const results = searchKnowledge(SAMPLE_CONTEXT, "alert", 1);
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("chunk_1");
    expect(results[0].text).toContain("alert");
  });

  it('handles empty embeddings gracefully', () => {
    const emptyContext: LoadedKnowledge = { knowledge: null, embeddings: [] };
    const results = nearestChunks(emptyContext, [0.1, 0.2, 0.3], 3);
    expect(results).toHaveLength(0);
  });

  it('handles null embeddings gracefully', () => {
    const nullContext: LoadedKnowledge = { knowledge: null, embeddings: null };
    const results = searchByText(nullContext, "test", 3);
    expect(results).toHaveLength(0);
  });
});
