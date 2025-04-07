import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: true
    },
    // Ensure all keys are properly loaded even if missing
    returnNull: false,
    returnEmptyString: false,
    returnObjects: true // Enable accessing objects in translations
  });

export default i18n; 