import ky from 'ky';
import { z } from 'zod';
import { err, ok, Result } from 'neverthrow';

// Types d'erreurs normalisés
export type AppError =
  | { kind: 'Network'; message: string; status?: number }
  | { kind: 'Validation'; message: string; issues?: unknown }
  | { kind: 'ExternalAPI'; message: string; provider: string; details?: unknown }
  | { kind: 'Unknown'; message: string };

export const toAppError = (e: any): AppError => {
  if (e?.name === 'HTTPError') {
    return { 
      kind: 'Network', 
      message: e.message, 
      status: e.response?.status 
    };
  }
  if (e?.name === 'ZodError') {
    return { 
      kind: 'Validation', 
      message: 'Invalid payload', 
      issues: e.issues 
    };
  }
  return { 
    kind: 'Unknown', 
    message: String(e?.message ?? e) 
  };
};

// API client sécurisé avec ky
const api = ky.create({ 
  timeout: 10_000, 
  retry: { 
    limit: 2, 
    methods: ['get', 'post'] 
  } 
});

export async function safeJson<T extends z.ZodTypeAny>(
  url: string,
  schema: T,
  init?: RequestInit
): Promise<Result<z.infer<T>, AppError>> {
  try {
    const res = await api(url, init).json();
    const parsed = schema.safeParse(res);
    return parsed.success 
      ? ok(parsed.data) 
      : err(toAppError(parsed.error));
  } catch (e: any) { 
    return err(toAppError(e)); 
  }
}

// Wrapper pour les appels API avec gestion d'erreurs
export async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<Result<T, AppError>> {
  try {
    const result = await apiCall();
    return ok(result);
  } catch (e: any) {
    return err(toAppError(e));
  }
}
