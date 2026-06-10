import { create } from 'zustand';

import { INITIAL_HOLDINGS, type Holdings } from '@/features/shared';

interface PortfolioState {
  holdings: Holdings;
}

/**
 * Single source of truth for holdings. No public setters — the app's only
 * write goes through the swap-service seam (T14). `persist` wraps it in T05.
 */
export const usePortfolioStore = create<PortfolioState>()(() => ({
  holdings: INITIAL_HOLDINGS,
}));
