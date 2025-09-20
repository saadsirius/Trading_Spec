import { AppError, toAppError } from "@/lib/errors";

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new AppError(
        `HTTP ${response.status}: ${response.statusText}`,
        { status: response.status, code: 'HTTP_ERROR' }
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('Request timeout', { code: 'TIMEOUT' });
    }

    if (retries > 0 && !(error instanceof AppError)) {
      await sleep(1000 * (3 - retries)); // exponential backoff
      return apiCall<T>(url, options, retries - 1);
    }

    throw toAppError(error);
  }
}

export const api = {
  get: <T>(url: string) => apiCall<T>(url, { method: 'GET' }),
  post: <T>(url: string, data?: unknown) => 
    apiCall<T>(url, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  put: <T>(url: string, data?: unknown) => 
    apiCall<T>(url, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  delete: <T>(url: string) => apiCall<T>(url, { method: 'DELETE' }),
};
