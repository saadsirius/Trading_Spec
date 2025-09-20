/**
 * Gestion d'erreurs centralisée: typage + helpers d'affichage.
 */
export class AppError extends Error {
  code?: string; status?: number; meta?: Record<string, unknown>;
  constructor(message: string, opts: { code?: string; status?: number; meta?: Record<string, unknown> } = {}) {
    super(message); Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'AppError'; this.code = opts.code; this.status = opts.status; this.meta = opts.meta;
  }
}
export const isAppError = (e: unknown): e is AppError => e instanceof AppError;

export function toAppError(e: unknown, fallback = 'Une erreur est survenue'): AppError {
  if (isAppError(e)) return e;
  if (e instanceof Error) return new AppError(e.message);
  return new AppError(fallback);
}
