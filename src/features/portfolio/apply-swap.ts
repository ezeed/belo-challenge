import { big, type Holdings, type Transaction } from '@/features/shared';

/**
 * Pure holdings update for an executed swap — assumes the transaction was
 * already validated (T14). Unknown assets start from 0.
 */
export function applySwapToHoldings(
  holdings: Holdings,
  transaction: Transaction,
): Holdings {
  const from = big(String(holdings[transaction.fromId] ?? 0)).minus(
    String(transaction.fromAmount),
  );
  const to = big(String(holdings[transaction.toId] ?? 0)).plus(
    String(transaction.toAmount),
  );

  return {
    ...holdings,
    [transaction.fromId]: from.toNumber(),
    [transaction.toId]: to.toNumber(),
  };
}
