import { QueryClient } from '@tanstack/react-query';

import { ApiError, isTransientApiError } from '@/lib/errors';

const MAX_RETRIES = 3;
const MAX_RETRY_DELAY_MS = 30_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prices refresh at most once a minute; also kills dev hot-reload refetch spam.
      staleTime: 60_000,
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
