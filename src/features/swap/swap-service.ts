import {
  type CoinId,
  DEFAULT_SPREAD,
  type PriceMap,
  type Transaction,
} from '@/features/shared';
import { applySwap } from '@/features/portfolio';

import { calculateSwap } from './calculate-swap';

export interface ExecuteSwapParams {
  fromId: CoinId;
  toId: CoinId;
  /** Amount of fromId to swap, as a string for precision. */
  fromAmount: string;
  prices: PriceMap;
  /** Fractional spread, defaults to DEFAULT_SPREAD. */
  spread?: string;
}

/**
 * API-shaped write seam: the form validates and gates submit, this commits.
 * Sync/local today; swap the body for a real API call later, same signature.
 * `.toNumber()` happens only here, at the Transaction boundary.
 */
export async function executeSwap(
  params: ExecuteSwapParams,
): Promise<Transaction> {
  const { fromId, toId, fromAmount, prices, spread = DEFAULT_SPREAD } = params;

  const { toAmount, usdValue, rate, feeUsd } = calculateSwap(
    fromId,
    toId,
    fromAmount,
    prices,
    spread,
  );

  const timestamp = Date.now();
  const id = `${timestamp}-${Math.random().toString(36).slice(2, 9)}`;

  const transaction: Transaction = {
    id,
    timestamp,
    fromId,
    toId,
    fromAmount: parseFloat(fromAmount),
    toAmount: toAmount.toNumber(),
    usdValue: usdValue.toNumber(),
    rate: rate.toNumber(),
    feeUsd: feeUsd.toNumber(),
  };

  applySwap(transaction);
  return transaction;
}
