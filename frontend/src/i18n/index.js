import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import mm from './locales/mm.json';

i18n
  .use(LanguageDetector) // browser language cauch
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      mm: { translation: mm },
    },
    fallbackLng: 'en',        // other not found use english
    interpolation: {
      escapeValue: false,     // React is defect no need XSS 
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // choose lcaguage cauch
    },
  });

export default i18n;