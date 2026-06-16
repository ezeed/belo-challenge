import type { Big } from 'big.js';

import {
  big,
  type CoinId,
  DEFAULT_SPREAD,
  type PriceMap,
  spreadPair,
} from '@/features/shared';

export interface SwapCalculation {
  /**
   * Amount of the destination asset the user receives.
   * Big internally; callers building a Transaction record call .toNumber().
   */
  toAmount: Big;
  /**
   * USD value transferred (from-asset at sell price, before the buy spread
   * is applied to the destination leg).
   */
  usdValue: Big;
  /**
   * Units of toId received per 1 unit of fromId (effective exchange rate).
   */
  rate: Big;
  /**
   * Combined spread cost in USD: sell-side loss + buy-side markup.
   */
  feeUsd: Big;
}

/**
 * Pure swap calculation.
 *
 * Conversion path (business rule):
 *   fromAmount × sellPrice(fromId) = usdValue
 *   usdValue / buyPrice(toId)      = toAmount
 *
 * All math via big.js — never raw float arithmetic.
 * Prices are constructed from strings to avoid float imprecision at the seam.
 *
 * @param fromId   Source asset CoinId
 * @param toId     Destination asset CoinId
 * @param fromAmount  Amount of fromId to swap (as string for precision)
 * @param prices   Mid-price map (CoinGecko market prices)
 * @param spread   Fractional spread, defaults to DEFAULT_SPREAD (0.5%)
 */
export function calculateSwap(
  fromId: CoinId,
  toId: CoinId,
  fromAmount: string,
  prices: PriceMap,
  spread: string = DEFAULT_SPREAD,
): SwapCalculation {
  const fromMid = prices[fromId];
  const toMid = prices[toId];

  if (fromMid === undefined || toMid === undefined) {
    throw new Error(
      `calculateSwap: missing price for ${fromMid === undefined ? fromId : toId}`,
    );
  }

  const amount = big(fromAmount);
  const { sell: fromSell } = spreadPair(fromMid, spread);
  const { buy: toBuy } = spreadPair(toMid, spread);

  // USD received when selling fromId
  const usdValue = amount.times(fromSell);

  // Destination asset received by buying toId with that USD
  const toAmount = usdValue.div(toBuy);

  // Effective rate: toId units per 1 fromId unit
  const rate = toAmount.div(amount);

  // Fee = what would have been received at mid prices minus what we actually
  // received, expressed in USD.
  //   sell-side loss : amount × (fromMid − fromSell) = amount × fromMid × s
  //   buy-side markup: toAmount × (toBuy − toMid)    = usdValue × (toBuy/toMid − 1) × (toMid/toBuy)
  // Simpler equivalent: fee = amount × fromMid × s  +  toAmount × toMid × s
  const s = big(spread);
  const fromMidBig = big(fromMid);
  const toMidBig = big(toMid);
  const feeUsd = amount
    .times(fromMidBig)
    .times(s)
    .plus(toAmount.times(toMidBig).times(s));

  return { toAmount, usdValue, rate, feeUsd };
}
