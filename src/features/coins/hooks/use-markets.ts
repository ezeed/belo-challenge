import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { SUPPORTED_ASSET_IDS } from '@/features/shared';
import { getPriceRepository } from '@/lib/api';

export function useMarkets() {
  return useQuery({
    queryKey: ['markets', SUPPORTED_ASSET_IDS],
    queryFn: () => getPriceRepository().getMarkets(SUPPORTED_ASSET_IDS),
    // Keep the last good prices on screen across refetch errors and mock-mode
    // key changes, instead of collapsing to a spinner/empty state.
    placeholderData: keepPreviousData,
  });
}
