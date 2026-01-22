/**
 * Fetcher Helper
 *
 * Utility para usar com SWR e fazer requisições HTTP
 * com tratamento de erros padronizado
 */

import type { ApiSuccess, ApiError } from '@/lib/api/response';

export class FetchError extends Error {
  status: number;
  info: ApiError;

  constructor(message: string, status: number, info: ApiError) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.info = info;
  }
}

/**
 * Fetcher genérico para usar com SWR
 * Lança FetchError se a resposta não for ok
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);

  // Se não for OK, tenta parsear erro
  if (!res.ok) {
    let errorInfo: ApiError;

    try {
      errorInfo = await res.json();
    } catch {
      // Se não conseguir parsear JSON, cria erro genérico
      errorInfo = {
        success: false,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    throw new FetchError(
      errorInfo.error || 'An error occurred while fetching the data',
      res.status,
      errorInfo
    );
  }

  // Parse resposta de sucesso
  const data: ApiSuccess<T> = await res.json();
  return data.data;
}

/**
 * Fetcher para requisições POST/PUT/PATCH
 */
export async function fetcherWithBody<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorInfo: ApiError;

    try {
      errorInfo = await res.json();
    } catch {
      errorInfo = {
        success: false,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    throw new FetchError(
      errorInfo.error || 'An error occurred',
      res.status,
      errorInfo
    );
  }

  const data: ApiSuccess<T> = await res.json();
  return data.data;
}
