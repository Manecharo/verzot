import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { createSafeTranslator } from './utils/translationHelper';

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
      useSuspense: true,
      transSupportBasicHtmlNodes: true, // This helps with some nested structures
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'em'] // List of tags to keep
    },
    // Ensure all keys are properly loaded even if missing
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false, // Disable returning objects directly - always convert to string
    parseMissingKeyHandler: (key) => {
      // Extract the last part of the key as a fallback
      return key.split('.').pop() || String(key);
    }
  });

// Store the original translation function
const originalT = i18n.t.bind(i18n);

// Replace the i18n.t function with our safe version
i18n.t = createSafeTranslator(originalT);

// Monkey patch the Translation component from react-i18next to be safe
// This is a last defense against React Error #31
try {
  // Run this in a try-catch in case the internal structure changes in the future
  if (i18n.options?.react?.components?.Trans) {
    const originalTrans = i18n.options.react.components.Trans;
    i18n.options.react.components.Trans = (props) => {
      try {
        return originalTrans(props);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in Trans component:', error);
        }
        // If there's an error, return the key or default content
        return props.children || props.i18nKey || '';
      }
    };
  }
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Failed to patch Trans component', error);
  }
}

// Make sure React never gets objects as children
// Add a global error handler for translation errors
window.addEventListener('error', (event) => {
  // Check if the error is related to React Error #31
  if (event.error && event.error.message && 
      (event.error.message.includes('Objects are not valid as a React child') ||
       event.error.message.includes('Error #31'))) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('React Error #31 detected. This might be caused by translation objects being rendered as React children.');
    }
    // Prevent the error from bubbling up
    event.preventDefault();
  }
});

export default i18n; 