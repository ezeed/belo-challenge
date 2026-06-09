/**
 * Raw token values for consumers that take color props instead of
 * classNames (NativeTabs, React Navigation theme, charts).
 * Keep in sync with the HSL triplets in src/global.css — components
 * should always prefer the semantic Tailwind classes.
 */
export const BRAND = {
  indigo: '#4920E0',
  mint: '#2EDFA4',
} as const;

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  positive: string;
  positiveSurface: string;
  danger: string;
  chartUp: string;
  chartDown: string;
}

export const THEME: Record<'light' | 'dark', ThemeColors> = {
  light: {
    primary: BRAND.indigo,
    primaryForeground: '#FFFFFF',
    background: '#FCFCFD',
    surface: '#FFFFFF',
    surfaceMuted: '#F4F4F6',
    border: '#ECECEF',
    text: '#16161A',
    textMuted: '#8A8A90',
    positive: '#0FA571',
    positiveSurface: '#DDF7EC',
    danger: '#E5484D',
    chartUp: '#16C784',
    chartDown: '#EA3943',
  },
  dark: {
    primary: BRAND.mint,
    primaryForeground: '#06231A',
    background: '#0B0B0D',
    surface: '#1A1A1D',
    surfaceMuted: '#232327',
    border: '#2A2A2E',
    text: '#F5F5F7',
    textMuted: '#9A9AA0',
    positive: BRAND.mint,
    positiveSurface: '#15332A',
    danger: '#FF5A5F',
    chartUp: '#16C784',
    chartDown: '#EA3943',
  },
};
