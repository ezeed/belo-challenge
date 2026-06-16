import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

import { setMockMode } from '@/lib/api';
import { ApiError, type ApiErrorCode, isTransientApiError } from '@/lib/errors';
import { i18n } from '@/lib/i18n';

const MAX_RETRIES = 3;
const MAX_RETRY_DELAY_MS = 30_000;

// Error code → message key (literal map keeps i18n.t statically typed).
const ERROR_KEY = {
  RATE_LIMIT: 'errors.rateLimit',
  NETWORK_ERROR: 'errors.network',
  TIMEOUT: 'errors.timeout',
  SERVER_ERROR: 'errors.server',
  UNKNOWN: 'errors.unknown',
} as const satisfies Record<ApiErrorCode, `errors.${string}`>;

/**
 * Central query-error seam — fires once per query after the retries are
 * exhausted, so screens never inspect error state themselves. Surfaces a
 * single toast (deduped by a stable id) with a shortcut to Mock Mode, which
 * serves bundled fixtures and resolves any fetch failure (rate limit included).
 */
function showPricesErrorToast(error: unknown): void {
  const code: ApiErrorCode = error instanceof ApiError ? error.code : 'UNKNOWN';
  toast.error(i18n.t('errors.title'), {
    id: 'prices-error',
    description: i18n.t(ERROR_KEY[code]),
    action: {
      label: i18n.t('errors.useMock'),
      onClick: () => {
        setMockMode(true);
        void queryClient.invalidateQueries();
        toast.dismiss('prices-error');
      },
    },
  });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: showPricesErrorToast }),
  defaultOptions: {
    queries: {
      // Real-time prices: always stale, so refetches (mount, pull) hit the API.
      // The rate limit this invites is retried below, then surfaced as a toast.
      staleTime: 0,
      // Transient failures only (rate limit, network, timeout, 5xx).
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES && isTransientApiError(error),
      // Exponential backoff, except a 429's Retry-After wins.
      retryDelay: (attempt, error) => {
        const retryAfterMs =
          error instanceof ApiError ? error.retryAfterMs : undefined;
        return (
          retryAfterMs ?? Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS)
        );
      },
    },
  },
});
