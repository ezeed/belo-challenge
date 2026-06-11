import { useTranslation } from 'react-i18next';

import { useTheme } from '@/lib/theme';

import { setTheme, useSettingsStore, type ThemePreference } from '../store';
import { SegmentedPicker, type SegmentOption } from './segmented-picker';
import { SettingCard } from './setting-card';

export function ThemeCard() {
  const { t } = useTranslation();
  const { setColorScheme } = useTheme();
  const theme = useSettingsStore((s) => s.theme);

  const onChange = (next: ThemePreference) => {
    setTheme(next);
    setColorScheme(next);
  };

  const options: SegmentOption<ThemePreference>[] = [
    { label: t('settings.themeSystem'), value: 'system' },
    { label: t('settings.themeLight'), value: 'light' },
    { label: t('settings.themeDark'), value: 'dark' },
  ];

  return (
    <SettingCard title={t('settings.theme')}>
      <SegmentedPicker options={options} value={theme} onChange={onChange} />
    </SettingCard>
  );
}
