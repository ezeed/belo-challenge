import {
  type CoinId,
  DEFAULT_SPREAD,
  type PriceMap,
  type Transaction,
} from '@/features/shared';
import { applySwap } from '@/features/portfolio';

import { calculateSwap } from './calculate-swap';
import {
  validateSwap,
  type SwapValidationError as SwapValidationErrorCode,
} from './validate-swap';

export interface ExecuteSwapParams {
  fromId: CoinId;
  toId: CoinId;
  /** Amount of fromId to swap, as a string for precision. */
  fromAmount: string;
  prices: PriceMap;
  /** Current holdings snapshot for validation. Provided by the caller (useMutation hook reads from store). */
  holdings: Record<CoinId, number>;
  /** Fractional spread, defaults to DEFAULT_SPREAD. */
  spread?: string;
}

/**
 * Typed error thrown when a swap fails validation.
 *
 * The UI's useMutation error handler can branch on `err.code`.
 * Expected-invalid states are normally pre-checked by the form; this class
 * serves as the race guard for state that changed between the user's last
 * validation check and the final submit.
 */
export class SwapValidationError extends Error {
  readonly code: SwapValidationErrorCode;

  constructor(code: SwapValidationErrorCode) {
    super(`Swap validation failed: ${code}`);
    this.name = 'SwapValidationError';
    this.code = code;
  }
}

/**
 * API-shaped write seam (T14 decision).
 *
 * Internally pure: validate -> calculate -> build Transaction -> commit to store.
 * HTTP-swappable later: replace the body with a real API call, keep the signature.
 *
 * Balances stay in zustand only -- they never enter the query cache.
 *
 * Transaction.id: "<timestamp>-<random suffix>" -- no new dependency (Math.random).
 * .toNumber() is called ONLY here when constructing the Transaction record;
 * all intermediate math stays as Big throughout calculate-swap.
 *
 * Notification creation is NOT done here -- T16's orchestrating hook does it
 * after the returned Transaction resolves.
 */
export async function executeSwap(
  params: ExecuteSwapParams,
): Promise<Transaction> {
  const {
    fromId,
    toId,
    fromAmount,
    prices,
    holdings,
    spread = DEFAULT_SPREAD,
  } = params;

  // Validate -- returns typed result, never throws
  const validation = validateSwap({
    fromId,
    toId,
    fromAmount,
    holdings,
    prices,
    spread,
  });
  if (!validation.ok) {
    throw new SwapValidationError(validation.error);
  }

  // Calculate with big.js precision
  const { toAmount, usdValue, rate, feeUsd } = calculateSwap(
    fromId,
    toId,
    fromAmount,
    prices,
    spread,
  );

  // Build the Transaction record.
  // .toNumber() conversion happens ONLY here, at the portfolio-store boundary.
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

  // Commit to the portfolio store (sync, acyclic cross-feature import via barrel)
  applySwap(transaction);

  return transaction;
}
