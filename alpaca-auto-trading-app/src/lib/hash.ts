import { createHash } from 'crypto';
export function hashParams(obj: unknown): string {
  const json = JSON.stringify(obj, Object.keys(obj as any).sort());
  return createHash('sha256').update(json).digest('hex');
}
