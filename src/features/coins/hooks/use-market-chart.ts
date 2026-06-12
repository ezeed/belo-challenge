import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { CoinId } from '@/features/shared';
import { getPriceRepository } from '@/lib/api';

export function useMarketChart(id: CoinId) {
  return useQuery({
    queryKey: ['market-chart', id],
    queryFn: () => getPriceRepository().getMarketChart(id),
    // Keep the last good chart on screen across refetch errors and mock-mode
    // key changes, instead of collapsing to a spinner/empty state.
    placeholderData: keepPreviousData,
  });
}
