import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { CoinId } from '@/features/shared';
import { getPriceRepository, type ChartDays } from '@/lib/api';

export function useMarketChart(id: CoinId, days: ChartDays) {
  return useQuery({
    queryKey: ['market-chart', id, days],
    queryFn: () => getPriceRepository().getMarketChart(id, days),
    // Keep the last good chart on screen across refetch errors, range
    // switches and mock-mode key changes, instead of collapsing to a
    // spinner/empty state.
    placeholderData: keepPreviousData,
  });
}
