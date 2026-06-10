import { create } from 'zustand';

const apiKey = process.env.EXPO_PUBLIC_COINGECKO_API_KEY;

interface MockModeState {
  mockMode: boolean;
}

/**
 * Observable so UI (badge, settings switch) re-renders on change — a plain
 * module flag read during render misses updates. Session-only; `persist`
 * may wrap it in T05/T18.
 */
const useMockModeStore = create<MockModeState>()(() => ({
  mockMode: false,
}));

export function setMockMode(enabled: boolean): void {
  useMockModeStore.setState({ mockMode: enabled });
}

/** Without a key the mock fallback is forced — the Settings toggle disables itself. */
export function hasApiKey(): boolean {
  return Boolean(apiKey);
}

/** The key in effect: none while mock mode is on — or for a keyless reviewer. */
export function activeApiKey(): string | undefined {
  return useMockModeStore.getState().mockMode ? undefined : apiKey;
}

/** Non-reactive read — data layer only. UI must use `useMockActive`. */
export function isMockActive(): boolean {
  return !activeApiKey();
}

/** Reactive: subscribes the component to mock-mode changes. */
export function useMockActive(): boolean {
  const mockMode = useMockModeStore((state) => state.mockMode);
  return mockMode || !apiKey;
}
