// agent/load-knowledge.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { loadKnowledge, loadKnowledgeStrict } from './load-knowledge';

const SAMPLE_KNOWLEDGE = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  services: [{ name: "ClickHandlerService", file: "src/services/ClickHandlerService.ts", methods: [
    { name: "handleBuyClick", params: ["symbol: string", "price: number"], returns: "Promise<boolean>", description: "Places order" }
  ]}],
  hooks: [{ name: "useAlertHandlers", file: "src/hooks/useAlertHandlers.ts", params: [], returns: "void" }],
  types: [{ name: "Order", file: "src/types.ts", fields: [{ name: "symbol", type: "string" }]}],
  endpoints: [{ file: "src/app/api/orders/route.ts" }],
  files: [{ file: "src/services/ClickHandlerService.ts", imports: ["@/types", "@/services/OrderService"] }]
};

const SAMPLE_EMBEDDINGS = [
  { id: "chunk_0", text: "## Services", embedding: [0.1, 0.2, 0.3] }
];

describe('load-knowledge', () => {
  let tmpDir: string;
  let knowledgePath: string;
  let embeddingsPath: string;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kdoc-'));
    await fs.mkdir(path.join(tmpDir, 'vector'), { recursive: true });
    knowledgePath = path.join(tmpDir, 'knowledge.json');
    embeddingsPath = path.join(tmpDir, 'vector', 'knowledge_embeddings.json');
  });

  afterAll(async () => {
    // cleanup
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch {}
  });

  it('loads knowledge without embeddings (optional)', async () => {
    await fs.writeFile(knowledgePath, JSON.stringify(SAMPLE_KNOWLEDGE, null, 2), 'utf8');
    const { knowledge, embeddings } = await loadKnowledge({ baseDir: tmpDir, quiet: true });
    expect(knowledge?.schemaVersion).toBe("1.0.0");
    expect(embeddings).toBeNull();
  });

  it('loads embeddings when present', async () => {
    await fs.writeFile(embeddingsPath, JSON.stringify(SAMPLE_EMBEDDINGS, null, 2), 'utf8');
    const { embeddings } = await loadKnowledge({ baseDir: tmpDir, quiet: true });
    expect(embeddings?.[0]?.id).toBe("chunk_0");
  });

  it('memoizes by mtime (no re-read until changed)', async () => {
    const first = await loadKnowledge({ baseDir: tmpDir, quiet: true });
    const second = await loadKnowledge({ baseDir: tmpDir, quiet: true });
    expect(second).toBe(first); // same object (memoized)
    // change file to bump mtime
    await new Promise(r => setTimeout(r, 5));
    await fs.writeFile(knowledgePath, JSON.stringify({ ...SAMPLE_KNOWLEDGE, schemaVersion: "1.0.1" }, null, 2), 'utf8');
    const third = await loadKnowledge({ baseDir: tmpDir, quiet: true });
    expect(third).not.toBe(second);
    expect(third.knowledge?.schemaVersion).toBe("1.0.1");
  });

  it('strict mode throws when missing knowledge', async () => {
    const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kdoc-missing-'));
    await expect(loadKnowledgeStrict({ baseDir: emptyDir, quiet: true }))
      .rejects.toThrow(/knowledge\.json not found/);
  });

  it('tolerates invalid embeddings schema', async () => {
    await fs.writeFile(embeddingsPath, JSON.stringify([{ id: 1 }]), 'utf8'); // invalid
    const { embeddings } = await loadKnowledge({ baseDir: tmpDir, quiet: true });
    expect(embeddings).toBeNull();
  });
});