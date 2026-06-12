import type { Big } from 'big.js';

import { big, type Numeric } from './money';

/** Default spread: 0.5% each side of mid. */
export const DEFAULT_SPREAD = '0.005';

export interface SpreadPair {
  /** What the user gets selling the asset: `mid × (1 − s)`. */
  sell: Big;
  /** What the user pays buying the asset: `mid × (1 + s)`. */
  buy: Big;
}

/**
 * The app's only price model (business rules): every quote derives from the
 * mid price ± spread. T14's swap conversion legs reuse this.
 */
export function spreadPair(
  mid: Numeric,
  spread: Numeric = DEFAULT_SPREAD,
): SpreadPair {
  const m = big(mid);
  const s = big(spread);
  return {
    sell: m.times(big(1).minus(s)),
    buy: m.times(big(1).plus(s)),
  };
}
