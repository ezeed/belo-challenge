import { useQuery } from '@tanstack/react-query';

import { SUPPORTED_ASSET_IDS } from '@/features/shared';
import { getPriceRepository } from '@/lib/api';

export function useMarkets() {
  return useQuery({
    queryKey: ['markets', SUPPORTED_ASSET_IDS],
    queryFn: () => getPriceRepository().getMarkets(SUPPORTED_ASSET_IDS),
  });
}
