import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * Synchronous storage → zustand stores rehydrate before first render
 * (no hydration flash, no async race).
 */
export const storage = createMMKV({ id: 'belo' });

export const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};
