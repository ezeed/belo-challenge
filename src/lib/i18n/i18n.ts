// Hermes lacks Intl.PluralRules; i18next v24+ hard-requires it — without this
// polyfill `changeLanguage()` throws (app crash, looping via the persisted pref).
import 'intl-pluralrules';

import { getLocales } from 'expo-localization';
import i18next, { use as applyPlugin } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === 'es' ? 'es' : 'en';
}

void applyPlugin(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    // React already escapes rendered strings.
    escapeValue: false,
  },
});

export default i18next;
