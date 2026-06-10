import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

interface PrivacyState {
  hideAmounts: boolean;
}

/** Hides every monetary amount app-wide (balances, values); percentages stay visible. */
export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (): PrivacyState => ({
      hideAmounts: false,
    }),
    {
      name: 'privacy',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

export function toggleHideAmounts(): void {
  usePrivacyStore.setState((state) => ({ hideAmounts: !state.hideAmounts }));
}

/** Placeholder rendered in place of any masked amount. */
export const MASKED_AMOUNT = '••••';
