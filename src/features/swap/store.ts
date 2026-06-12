import { create } from 'zustand';

import type { CoinId } from '@/features/shared';

interface SwapPairState {
  fromId: CoinId;
  toId: CoinId;
}

/**
 * Session-only pair state, shared between the swap screen and the
 * asset-picker sheet route (a route can't receive an onSelect callback).
 * Amount stays local to the swap screen — only the pair is shared.
 */
export const useSwapPairStore = create<SwapPairState>()(() => ({
  fromId: 'tether',
  toId: 'bitcoin',
}));

/** Picking the opposite side's asset swaps the sides instead of erroring. */
export function selectFromAsset(id: CoinId): void {
  useSwapPairStore.setState((prev) =>
    id === prev.toId ? { fromId: id, toId: prev.fromId } : { fromId: id },
  );
}

export function selectToAsset(id: CoinId): void {
  useSwapPairStore.setState((prev) =>
    id === prev.fromId ? { fromId: prev.toId, toId: id } : { toId: id },
  );
}

export function flipPair(): void {
  useSwapPairStore.setState((prev) => ({
    fromId: prev.toId,
    toId: prev.fromId,
  }));
}
