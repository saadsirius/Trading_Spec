/**
 * File: agent/load-knowledge-improved.ts
 * Description: Improved loadKnowledge with better error handling, tolerant schema, and customizable paths.
 */
import { promises as fs } from 'fs';
import path from 'path';

// ---- Types ------------------------------------------------------------------

export type ServiceMethod = {
  name: string;
  params: string[];
  returns: string;
  description?: string;
};

export type ServiceEntry = {
  file?: string;
  name: string;
  methods?: ServiceMethod[];
};

export type HookEntry = {
  file?: string;
  name: string;
  params?: string[];
  returns?: string;
  description?: string;
};

export type TypeField = { name: string; type: string };
export type TypeEntry = { file?: string; name: string; fields?: TypeField[] };

export type FileImports = { file: string; imports: string[] };

export type KnowledgeDoc = {
  schemaVersion: string;
  generatedAt: string; // ISO date
  services: ServiceEntry[];
  hooks: HookEntry[];
  types: TypeEntry[];
  endpoints?: { file: string }[];
  files?: FileImports[];
};

export type EmbeddingEntry = { id: string; text: string; embedding: number[] };

export type LoadedKnowledge = {
  knowledge: KnowledgeDoc | null;
  embeddings: EmbeddingEntry[] | null;
};

// ---- Lightweight validation (no external deps) -------------------------------

function isISODate(s: string): boolean {
  return typeof s === 'string' && !Number.isNaN(Date.parse(s));
}

function validateKnowledge(k: any): { valid: boolean; errors: string[]; coerced: boolean } {
  const errors: string[] = [];
  let coerced = false;
  
  if (!k || typeof k !== 'object') {
    errors.push('Knowledge must be an object');
    return { valid: false, errors, coerced };
  }
  
  if (typeof k.schemaVersion !== 'string') {
    errors.push('schemaVersion must be a string');
  }
  
  if (typeof k.generatedAt !== 'string' || !isISODate(k.generatedAt)) {
    errors.push('generatedAt must be a valid ISO date string');
  }
  
  // Coerce missing arrays to empty arrays instead of failing
  if (!Array.isArray(k.services)) {
    k.services = [];
    errors.push('services coerced to empty array (was not an array)');
    coerced = true;
  }
  
  if (!Array.isArray(k.hooks)) {
    k.hooks = [];
    errors.push('hooks coerced to empty array (was not an array)');
    coerced = true;
  }
  
  if (!Array.isArray(k.types)) {
    k.types = [];
    errors.push('types coerced to empty array (was not an array)');
    coerced = true;
  }
  
  if (!Array.isArray(k.endpoints)) {
    k.endpoints = [];
  }
  
  if (!Array.isArray(k.files)) {
    k.files = [];
  }
  
  return { valid: errors.length === 0 || errors.every(e => e.includes('coerced')), errors, coerced };
}

function validateEmbeddings(arr: any): arr is EmbeddingEntry[] {
  return (
    Array.isArray(arr) &&
    arr.every(
      (e) =>
        e &&
        typeof e === 'object' &&
        typeof e.id === 'string' &&
        typeof e.text === 'string' &&
        Array.isArray(e.embedding) &&
        e.embedding.every((n: any) => typeof n === 'number')
    )
  );
}

// ---- Memoized state ----------------------------------------------------------

let memo: {
  knowledgePath: string;
  embeddingsPath: string;
  knowledgeMtimeMs: number;
  embeddingsMtimeMs: number;
  value: LoadedKnowledge;
} | null = null;

// ---- Debug helper ------------------------------------------------------------

function debugPaths(baseDir: string, knowledgeFile: string, embeddingsFile: string) {
  const knowledgePath = path.resolve(baseDir, knowledgeFile);
  const embeddingsPath = path.resolve(baseDir, embeddingsFile);
  
  console.log('🔍 Knowledge loader debug:');
  console.log(`  Base dir: ${baseDir}`);
  console.log(`  Knowledge file: ${knowledgePath}`);
  console.log(`  Embeddings file: ${embeddingsPath}`);
  console.log(`  Knowledge exists: ${require('fs').existsSync(knowledgePath)}`);
  console.log(`  Embeddings exists: ${require('fs').existsSync(embeddingsPath)}`);
}

// ---- API --------------------------------------------------------------------

export type LoadKnowledgeOptions = {
  baseDir?: string;                        // defaults to process.cwd()
  knowledgeFile?: string;                  // defaults to 'knowledge.json'
  embeddingsFile?: string;                 // defaults to 'vector/knowledge_embeddings.json'
  requireKnowledge?: boolean;              // if true, throw when knowledge missing/invalid
  quiet?: boolean;                         // suppress console.info logs
  debug?: boolean;                         // show debug info about paths
};

export async function loadKnowledge(opts: LoadKnowledgeOptions = {}): Promise<LoadedKnowledge> {
  // Support environment variables for paths
  const baseDir = opts.baseDir ?? process.env.KNOWLEDGE_DIR ?? process.cwd();
  const knowledgeFile = opts.knowledgeFile ?? process.env.KNOWLEDGE_FILE ?? 'knowledge.json';
  const embeddingsFile = opts.embeddingsFile ?? path.join('vector', 'knowledge_embeddings.json');
  
  const knowledgePath = path.resolve(baseDir, knowledgeFile);
  const embeddingsPath = path.resolve(baseDir, embeddingsFile);

  if (opts.debug) {
    debugPaths(baseDir, knowledgeFile, embeddingsFile);
  }

  // Get mtimes (missing files => mtime 0)
  const [kStat, eStat] = await Promise.allSettled([fs.stat(knowledgePath), fs.stat(embeddingsPath)]);
  const kMtime = kStat.status === 'fulfilled' ? kStat.value.mtimeMs : 0;
  const eMtime = eStat.status === 'fulfilled' ? eStat.value.mtimeMs : 0;

  // Return memoized if unchanged
  if (
    memo &&
    memo.knowledgePath === knowledgePath &&
    memo.embeddingsPath === embeddingsPath &&
    memo.knowledgeMtimeMs === kMtime &&
    memo.embeddingsMtimeMs === eMtime
  ) {
    return memo.value;
  }

  // (Re)load files
  const result: LoadedKnowledge = { knowledge: null, embeddings: null };

  // Knowledge
  if (kMtime > 0) {
    try {
      const raw = await fs.readFile(knowledgePath, 'utf8');
      const json = JSON.parse(raw);
      const validation = validateKnowledge(json);
      
      if (!validation.valid) {
        const msg = `Invalid knowledge.json schema at ${knowledgePath}: ${validation.errors.join(', ')}`;
        if (opts.requireKnowledge) throw new Error(msg);
        if (!opts.quiet) {
          console.warn('⚠️', msg);
          if (validation.coerced) {
            console.info('ℹ️ Schema was automatically coerced to valid format');
          }
        }
      } else {
        result.knowledge = json;
        if (validation.coerced && !opts.quiet) {
          console.info('ℹ️ Schema was automatically coerced to valid format');
        }
      }
    } catch (err) {
      const msg = `Failed to read/parse knowledge.json at ${knowledgePath}: ${(err as Error).message}`;
      if (opts.requireKnowledge) throw new Error(msg);
      if (!opts.quiet) console.warn('⚠️', msg);
    }
  } else if (opts.requireKnowledge) {
    throw new Error(`knowledge.json not found at ${knowledgePath}`);
  } else if (!opts.quiet) {
    console.info(`ℹ️ knowledge.json not found at ${knowledgePath} (continuing with null)`);
  }

  // Embeddings (optional)
  if (eMtime > 0) {
    try {
      const raw = await fs.readFile(embeddingsPath, 'utf8');
      const json = JSON.parse(raw);
      if (!validateEmbeddings(json)) {
        if (!opts.quiet) console.warn(`⚠️ Invalid embeddings schema at ${embeddingsPath}`);
      } else {
        result.embeddings = json;
      }
    } catch (err) {
      if (!opts.quiet) console.warn(`⚠️ Failed to read/parse embeddings at ${embeddingsPath}: ${(err as Error).message}`);
    }
  } else if (!opts.quiet) {
    // silent if missing; it's optional
  }

  // Memoize
  memo = {
    knowledgePath,
    embeddingsPath,
    knowledgeMtimeMs: kMtime,
    embeddingsMtimeMs: eMtime,
    value: result,
  };

  return result;
}

// Convenience: hard-fail variant for agents that require knowledge.json
export async function loadKnowledgeStrict(opts: Omit<LoadKnowledgeOptions, 'requireKnowledge'> = {}) {
  return loadKnowledge({ ...opts, requireKnowledge: true });
}

// Example:
// const { knowledge, embeddings } = await loadKnowledge();
// graph.memory.upsert('project-docs', { knowledge, embeddings });
