import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import fi from './locales/fi.json';
import en from './locales/en.json';

export type Lang = 'fi' | 'en';
export const LANGS: Lang[] = ['fi', 'en'];

/** Phone language decides the default; Finnish is the launch language. More locales: add a JSON file. */
export function deviceLang(): Lang {
  const tag = getLocales()[0]?.languageCode ?? 'fi';
  return tag === 'en' ? 'en' : 'fi';
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { fi: { translation: fi }, en: { translation: en } },
    lng: deviceLang(),
    fallbackLng: 'fi',
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnNull: false,
  });
}

export default i18n;
