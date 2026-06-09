import { useColorScheme } from 'nativewind';

import { THEME, type ThemeColors } from './colors';

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
}

export function useTheme(): Theme {
  const { colorScheme, setColorScheme } = useColorScheme();
  const scheme = colorScheme ?? 'light';

  return { scheme, colors: THEME[scheme], setColorScheme };
}
