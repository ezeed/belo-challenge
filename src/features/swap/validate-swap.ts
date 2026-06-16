import {
  big,
  type CoinId,
  type Holdings,
  DEFAULT_SPREAD,
  type PriceMap,
  spreadPair,
} from '@/features/shared';

/** Minimum swap value in USD. */
export const MIN_SWAP_USD = '1';

export type SwapValidationError =
  | 'INVALID_AMOUNT'
  | 'SAME_ASSET'
  | 'INSUFFICIENT_FUNDS'
  | 'BELOW_MINIMUM'
  | 'MISSING_PRICE';

export type SwapValidationResult =
  | { ok: true }
  | { ok: false; error: SwapValidationError };

export interface ValidateSwapParams {
  fromId: CoinId;
  toId: CoinId;
  /** Amount as a string to avoid float precision issues at the call site. */
  fromAmount: string;
  holdings: Holdings;
  prices: PriceMap;
  /** Fractional spread, defaults to DEFAULT_SPREAD (0.5%). */
  spread?: string;
}

/**
 * Pure swap validator -- never throws, returns a typed result.
 *
 * Checks in order (fail-fast):
 *  1. INVALID_AMOUNT  -- non-positive, NaN, or unparseable
 *  2. SAME_ASSET      -- fromId === toId
 *  3. MISSING_PRICE   -- either leg's mid price is absent from the price map
 *  4. BELOW_MINIMUM   -- fromAmount x sellPrice < MIN_SWAP_USD (1 USD)
 *  5. INSUFFICIENT_FUNDS -- fromAmount > holdings[fromId]
 */
export function validateSwap(params: ValidateSwapParams): SwapValidationResult {
  const {
    fromId,
    toId,
    fromAmount,
    holdings,
    prices,
    spread = DEFAULT_SPREAD,
  } = params;

  // 1. Validate the amount is a parseable, positive, finite number.
  let amount;
  try {
    amount = big(fromAmount);
  } catch {
    return { ok: false, error: 'INVALID_AMOUNT' };
  }

  if (!amount.gt(0)) {
    return { ok: false, error: 'INVALID_AMOUNT' };
  }

  // 2. Prevent same-asset swaps.
  if (fromId === toId) {
    return { ok: false, error: 'SAME_ASSET' };
  }

  // 3. Ensure both legs have prices.
  const fromMid = prices[fromId];
  const toMid = prices[toId];

  if (fromMid === undefined || toMid === undefined) {
    return { ok: false, error: 'MISSING_PRICE' };
  }

  // 4. Minimum 1 USD equivalent (from-asset valued at its sell price).
  const { sell: fromSell } = spreadPair(fromMid, spread);
  const usdValue = amount.times(fromSell);

  if (usdValue.lt(MIN_SWAP_USD)) {
    return { ok: false, error: 'BELOW_MINIMUM' };
  }

  // 5. Sufficient balance.
  const balance = big(holdings[fromId]);

  if (amount.gt(balance)) {
    return { ok: false, error: 'INSUFFICIENT_FUNDS' };
  }

  return { ok: true };
}
