import { Big } from 'big.js';

import type { CoinId, Holdings } from './assets';
import { big } from './money';

export type PriceMap = Partial<Record<CoinId, number>>;

/** USD value of one holding; a missing price values it at 0. */
export function valueAsset(amount: number, priceUsd?: number): Big {
  if (priceUsd === undefined) return big(0);
  return big(amount).times(big(priceUsd));
}

/** Consolidated USD value of all holdings. */
export function valuePortfolio(holdings: Holdings, prices: PriceMap): Big {
  return Object.entries(holdings).reduce(
    (total, [id, amount]) => total.plus(valueAsset(amount, prices[id])),
    big(0),
  );
}
