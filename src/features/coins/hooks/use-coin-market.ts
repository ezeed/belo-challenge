import type { CoinId } from '@/features/shared';

import { useMarkets } from './use-markets';

/**
 * One coin's market data, derived from the single batched markets query —
 * never a per-coin request (rate-limit rule).
 */
export function useCoinMarket(id: CoinId) {
  const { data, isPending } = useMarkets();
  return { coin: data?.find((market) => market.id === id), isPending };
}
