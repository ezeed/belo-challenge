import { useMemo } from 'react';

import { useMarkets } from '@/features/coins';
import { usePortfolioStore } from '@/features/portfolio';
import { SUPPORTED_ASSETS, type CoinId } from '@/features/shared';

/** One side of the swap: catalog asset + market image + current holding. */
export interface SwapSideAsset {
  id: CoinId;
  symbol: string;
  name: string;
  image?: string;
  balance: number;
}

/** Catalog × market images × holdings — used by the form and the picker sheet. */
export function useSwapAssets(): SwapSideAsset[] {
  const holdings = usePortfolioStore((state) => state.holdings);
  const { data: markets } = useMarkets();

  return useMemo(
    () =>
      SUPPORTED_ASSETS.map((asset) => ({
        ...asset,
        image: markets?.find((coin) => coin.id === asset.id)?.image,
        balance: holdings[asset.id] ?? 0,
      })),
    [holdings, markets],
  );
}
