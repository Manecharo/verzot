/**
 * Translation debugging utility
 * 
 * This utility can help identify missing translations or issues with translation keys
 */

/**
 * Checks if a translation key exists in the current language
 * @param {Object} i18n - i18next instance
 * @param {string} key - Translation key to check
 * @returns {boolean} - Whether the key exists
 */
export const translationExists = (i18n, key) => {
  if (!i18n || !key) return false;
  
  // Get the current language
  const lng = i18n.language;
  
  // Check if the key exists in the current language
  const translation = i18n.getResource(lng, 'translation', key);
  
  return !!translation;
};

/**
 * Logs missing translation keys to the console in development
 * @param {Object} i18n - i18next instance
 * @param {string} key - Translation key to check
 */
export const logMissingTranslation = (i18n, key) => {
  if (process.env.NODE_ENV === 'development' && !translationExists(i18n, key)) {
    console.warn(`[Translation] Missing key: ${key} for language: ${i18n.language}`);
  }
};

/**
 * Safely translates a key, with fallback to key itself
 * @param {Function} t - Translation function from useTranslation
 * @param {Object} i18n - i18next instance
 * @param {string} key - Translation key
 * @param {Object} options - Translation options
 * @returns {string} - Translated text or key
 */
export const safeTranslate = (t, i18n, key, options = {}) => {
  logMissingTranslation(i18n, key);
  return t(key, options);
}; 