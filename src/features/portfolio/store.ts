import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  INITIAL_HOLDINGS,
  type Holdings,
  type Transaction,
} from '@/features/shared';
import { zustandStorage } from '@/lib/storage';

import { applySwapToHoldings } from './apply-swap';

interface PortfolioState {
  holdings: Holdings;
  transactions: Transaction[];
}

/**
 * Single source of truth for holdings + transaction history. No public
 * setters — the app's only write goes through the swap-service seam (T14),
 * which calls `applySwap`.
 */
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    () => ({
      holdings: INITIAL_HOLDINGS,
      transactions: [] as Transaction[],
    }),
    {
      name: 'portfolio',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

/** Swap-service only (T14) — never called from screens. */
export function applySwap(transaction: Transaction): void {
  usePortfolioStore.setState((state) => ({
    holdings: applySwapToHoldings(state.holdings, transaction),
    transactions: [transaction, ...state.transactions],
  }));
}

/** Settings "reset portfolio" (T18): re-seed balances, drop history. */
export function resetPortfolio(): void {
  usePortfolioStore.setState({
    holdings: INITIAL_HOLDINGS,
    transactions: [],
  });
}
