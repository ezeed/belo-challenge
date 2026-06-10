import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prices refresh at most once a minute; also kills dev hot-reload refetch spam.
      staleTime: 60_000,
    },
  },
});
