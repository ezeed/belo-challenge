import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

export type ThemePreference = 'light' | 'dark' | 'system';
/** `null` = follow device locale. */
export type LanguagePreference = 'en' | 'es' | null;

interface SettingsState {
  theme: ThemePreference;
  language: LanguagePreference;
}

/**
 * Persisted user preferences. `mockMode` deliberately lives elsewhere
 * (`lib/api/mock-mode.ts`, session-only): stale mock config must not stick
 * across launches; the keyless fallback covers reviewers.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    () => ({
      theme: 'system' as ThemePreference,
      language: null as LanguagePreference,
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

export function setTheme(theme: ThemePreference): void {
  useSettingsStore.setState({ theme });
}

export function setLanguage(language: LanguagePreference): void {
  useSettingsStore.setState({ language });
}
