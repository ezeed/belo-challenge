import { useMemo } from 'react';

import { useMarkets } from '@/features/coins';
import {
  big,
  SUPPORTED_ASSETS,
  valueAsset,
  valuePortfolio,
  type CoinId,
  type PriceMap,
} from '@/features/shared';

import { usePortfolioStore } from '../store';

export type SortDirection = 'asc' | 'desc';

export interface PortfolioRow {
  id: CoinId;
  name: string;
  symbol: string;
  image?: string;
  amount: number;
  /** Big serialized to string — keeps row props primitive for memo. */
  valueUsd: string;
  changePct24h?: number;
}

/** Holdings (client state) × market prices (server state), joined at render. */
export function usePortfolio(sort: SortDirection) {
  const holdings = usePortfolioStore((state) => state.holdings);
  const { data: markets, isPending } = useMarkets();

  const totalUsd = useMemo(() => {
    const prices: PriceMap = Object.fromEntries(
      (markets ?? []).map((coin) => [coin.id, coin.current_price]),
    );
    return valuePortfolio(holdings, prices).toString();
  }, [holdings, markets]);

  const rows = useMemo<PortfolioRow[]>(() => {
    const factor = sort === 'asc' ? 1 : -1;
    return SUPPORTED_ASSETS.map((asset): PortfolioRow => {
      const market = markets?.find((coin) => coin.id === asset.id);
      const amount = holdings[asset.id] ?? 0;
      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        image: market?.image,
        amount,
        valueUsd: valueAsset(amount, market?.current_price).toString(),
        changePct24h: market?.price_change_percentage_24h,
      };
    }).sort((a, b) => factor * big(a.valueUsd).cmp(b.valueUsd));
  }, [holdings, markets, sort]);

  return { rows, totalUsd, isPending };
}
