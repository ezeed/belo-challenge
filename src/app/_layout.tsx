import '@/global.css';

import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';

import { useSettingsStore } from '@/features/settings';
import { i18n } from '@/lib/i18n';
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
  // no-op outside dev — inspect queries via the dev menu's plugin entry
  useReactQueryDevTools(queryClient);
  const { scheme, setColorScheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const { theme, language } = useSettingsStore.getState();
    setColorScheme(theme);
    if (language) void i18n.changeLanguage(language);
    // Mount-once on purpose: this re-applies persisted prefs at launch.
    // Depending on `setColorScheme` loops — nativewind recreates it per render,
    // and this layout re-renders on language change (useTranslation titles):
    // changeLanguage → re-render → effect → changeLanguage → crash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={NAV_THEMES[scheme]}>
          <Stack
            screenOptions={{
              // pushed screens: header blends into the body (no surface seam)
              headerStyle: { backgroundColor: THEME[scheme].background },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="coin/[id]"
              options={{
                title: t('coin.title'),
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="notifications"
              options={{
                title: t('notifications.title'),
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="asset-picker"
              options={{
                headerShown: false,
                gestureEnabled: true,
                presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
                sheetGrabberVisible: true,
                sheetAllowedDetents: 'fitToContents',
                animation:
                  Platform.OS === 'android' ? 'slide_from_bottom' : 'default',
              }}
            />
          </Stack>
          <Toaster theme={scheme} richColors closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
