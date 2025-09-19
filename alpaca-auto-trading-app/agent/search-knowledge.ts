// agent/search-knowledge.ts
import { LoadedKnowledge } from './load-knowledge';

// naive vector cosine
function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) { 
    dot += a[i]*b[i]; 
    na += a[i]*a[i]; 
    nb += b[i]*b[i]; 
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export function nearestChunks(ctx: LoadedKnowledge, queryEmbedding: number[], k = 3) {
  const emb = ctx.embeddings ?? [];
  return emb
    .map(e => ({ id: e.id, text: e.text, score: cosine(queryEmbedding, e.embedding) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, k);
}

// Additional helper for text-based search (fallback when no embeddings)
export function searchByText(ctx: LoadedKnowledge, query: string, k = 3) {
  const emb = ctx.embeddings ?? [];
  const queryLower = query.toLowerCase();
  
  return emb
    .map(e => {
      const textLower = e.text.toLowerCase();
      const score = textLower.includes(queryLower) ? 1 : 0;
      return { id: e.id, text: e.text, score };
    })
    .filter(e => e.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, k);
}

// Combined search that tries vector first, falls back to text
export function searchKnowledge(ctx: LoadedKnowledge, query: string | number[], k = 3) {
  if (Array.isArray(query)) {
    // Vector search
    return nearestChunks(ctx, query, k);
  } else {
    // Text search
    return searchByText(ctx, query, k);
  }
}
