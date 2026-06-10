import { create } from 'zustand';

interface PrivacyState {
  hideAmounts: boolean;
}

/** Hides every monetary amount app-wide (balances, values); percentages stay visible. */
export const usePrivacyStore = create<PrivacyState>()(() => ({
  hideAmounts: false,
}));

export function toggleHideAmounts(): void {
  usePrivacyStore.setState((state) => ({ hideAmounts: !state.hideAmounts }));
}

/** Placeholder rendered in place of any masked amount. */
export const MASKED_AMOUNT = '••••';
