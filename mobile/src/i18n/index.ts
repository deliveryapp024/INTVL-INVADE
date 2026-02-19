// i18n/index.ts - Internationalization setup
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import en from './translations/en.json';
import hi from './translations/hi.json';
import mr from './translations/mr.json';
import ta from './translations/ta.json';
import te from './translations/te.json';
import kn from './translations/kn.json';
import bn from './translations/bn.json';
import gu from './translations/gu.json';
import ml from './translations/ml.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  bn: { translation: bn },
  gu: { translation: gu },
  ml: { translation: ml },
};

// Safe locale detection with fallback
const getLocale = () => {
  try {
    return Localization?.locale?.split('-')[0] || 'en';
  } catch {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLocale(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
];
