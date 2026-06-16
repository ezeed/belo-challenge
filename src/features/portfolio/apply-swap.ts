import { big, type Holdings, type Transaction } from '@/features/shared';

/**
 * Pure holdings update for an executed swap — assumes the transaction was
 * already validated by the form.
 */
export function applySwapToHoldings(
  holdings: Holdings,
  transaction: Transaction,
): Holdings {
  const from = big(holdings[transaction.fromId]).minus(transaction.fromAmount);
  const to = big(holdings[transaction.toId]).plus(transaction.toAmount);

  return {
    ...holdings,
    [transaction.fromId]: from.toNumber(),
    [transaction.toId]: to.toNumber(),
  };
}
