import { getLocales } from 'expo-localization';
import { useTranslation } from 'react-i18next';

import { i18n } from '@/lib/i18n';

import { setLanguage, useSettingsStore, type LanguagePreference } from '../store';
import { SegmentedPicker, type SegmentOption } from './segmented-picker';
import { SettingCard } from './setting-card';

/** `'system'` follows the device; the store models that as `null`. */
type LangSegment = 'system' | 'en' | 'es';

function deviceLang(): 'en' | 'es' {
  return getLocales()[0]?.languageCode === 'es' ? 'es' : 'en';
}

export function LanguageCard() {
  const { t } = useTranslation();
  const stored = useSettingsStore((s) => s.language);
  const value: LangSegment = stored ?? 'system';

  const onChange = (next: LangSegment) => {
    const pref: LanguagePreference = next === 'system' ? null : next;
    setLanguage(pref);
    void i18n.changeLanguage(next === 'system' ? deviceLang() : next);
  };

  const options: SegmentOption<LangSegment>[] = [
    { label: t('settings.languageSystem'), value: 'system' },
    { label: t('settings.languageEn'), value: 'en' },
    { label: t('settings.languageEs'), value: 'es' },
  ];

  return (
    <SettingCard title={t('settings.language')}>
      <SegmentedPicker options={options} value={value} onChange={onChange} />
    </SettingCard>
  );
}
