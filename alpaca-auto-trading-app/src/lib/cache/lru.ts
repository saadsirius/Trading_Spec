type Entry<T> = { v: T; at: number; ttl: number };
const store = new Map<string, Entry<any>>();
const inflight = new Map<string, Promise<any>>();

export function cacheGet<T>(k: string): T | null {
  const e = store.get(k);
  if (!e) return null;
  if (Date.now() - e.at > e.ttl) { 
    store.delete(k); 
    return null; 
  }
  return e.v as T;
}

export function cacheSet<T>(k: string, v: T, ttl: number) {
  store.set(k, { v, at: Date.now(), ttl });
}

export async function dedup<T>(k: string, fn: () => Promise<T>): Promise<T> {
  const h = inflight.get(k);
  if (h) return h as Promise<T>;
  const p = fn().finally(() => inflight.delete(k));
  inflight.set(k, p);
  return p;
}
