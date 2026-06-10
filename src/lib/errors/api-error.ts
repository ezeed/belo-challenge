export type ApiErrorCode =
  | 'RATE_LIMIT'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

/** Expected failure states — consumers branch on `code`, never on raw client errors. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  /** From `Retry-After` on 429 — the retry policy respects it over backoff. */
  readonly retryAfterMs?: number;

  constructor(
    code: ApiErrorCode,
    options?: { status?: number; retryAfterMs?: number; cause?: unknown },
  ) {
    super(`API error: ${code}`, { cause: options?.cause });
    this.name = 'ApiError';
    this.code = code;
    this.status = options?.status;
    this.retryAfterMs = options?.retryAfterMs;
  }
}

export function apiErrorFromStatus(
  status: number,
  retryAfterHeader?: string | null,
): ApiError {
  if (status === 429) {
    const seconds = Number(retryAfterHeader);
    return new ApiError('RATE_LIMIT', {
      status,
      retryAfterMs:
        retryAfterHeader && Number.isFinite(seconds)
          ? seconds * 1000
          : undefined,
    });
  }
  if (status >= 500) return new ApiError('SERVER_ERROR', { status });
  return new ApiError('UNKNOWN', { status });
}

const TRANSIENT_CODES: readonly ApiErrorCode[] = [
  'RATE_LIMIT',
  'NETWORK_ERROR',
  'TIMEOUT',
  'SERVER_ERROR',
];

/** Worth retrying — the failure can resolve on its own. */
export function isTransientApiError(error: unknown): boolean {
  return error instanceof ApiError && TRANSIENT_CODES.includes(error.code);
}
