export type Toast = { id: string; title: string; desc?: string; ttlMs?: number };
type Callback = (t: Toast, kind: 'show'|'update'|'dismiss') => void;

const subs = new Set<Callback>();
const live = new Map<string, Toast>();

export const Toasts = {
  subscribe(cb: Callback) { subs.add(cb); return () => subs.delete(cb); },
  /** show: auto-ID si non fourni */
  show(title: string, desc?: string, ttlMs?: number) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const t: Toast = { id, title, desc, ttlMs };
    live.set(id, t);
    subs.forEach(cb => cb(t, 'show'));
    if (ttlMs && ttlMs > 0) setTimeout(() => Toasts.dismiss(id), ttlMs);
    return id;
  },
  /** showById: utile pour remplacer un toast existant (id stable) */
  showById(id: string, title: string, desc?: string, ttlMs?: number) {
    const t: Toast = { id, title, desc, ttlMs };
    live.set(id, t);
    subs.forEach(cb => cb(t, 'show'));
    if (ttlMs && ttlMs > 0) setTimeout(() => Toasts.dismiss(id), ttlMs);
    return id;
  },
  update(id: string, patch: Partial<Omit<Toast,'id'>>) {
    const cur = live.get(id); if (!cur) return false;
    const t = { ...cur, ...patch };
    live.set(id, t);
    subs.forEach(cb => cb(t, 'update'));
    return true;
  },
  dismiss(id: string) {
    const cur = live.get(id); if (!cur) return false;
    live.delete(id);
    subs.forEach(cb => cb(cur, 'dismiss'));
    return true;
  }
};