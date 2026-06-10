import '@/global.css';
import '@/lib/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { queryClient } from '@/lib/query';
import { THEME, useTheme } from '@/lib/theme';

const NAV_THEMES = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: THEME.light.primary,
      background: THEME.light.background,
      card: THEME.light.surface,
      text: THEME.light.text,
      border: THEME.light.border,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: THEME.dark.primary,
      background: THEME.dark.background,
      card: THEME.dark.surface,
      text: THEME.dark.text,
      border: THEME.dark.border,
    },
  },
} as const;

export default function RootLayout() {
  const { scheme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEMES[scheme]}>
        <AppTabs />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
