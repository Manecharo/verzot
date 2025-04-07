/**
 * Safely converts a translation result to a string, handling all edge cases
 * that might cause "Objects are not valid as React children" errors
 * 
 * @param {any} value - The translation result to convert to string
 * @param {string} fallback - Fallback value if the translation is an object
 * @returns {string} - A safe string value
 */
export const toSafeString = (value, fallback = '') => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return fallback;
  }
  
  // Handle objects (including translations with nested data)
  if (typeof value === 'object') {
    // For React Error #31 prevention, never return objects
    return fallback;
  }
  
  // Handle numbers, booleans, etc.
  return String(value);
};

/**
 * Global safeguard for all translation outputs
 * This can be applied to i18next to globally prevent React Error #31
 * 
 * @param {Function} t - Original translation function
 * @returns {Function} - Safe translation function
 */
export const createSafeTranslator = (originalTranslate) => {
  return function safeTFunction(key, options = {}) {
    if (!key || typeof key !== 'string') {
      return '';
    }
    
    try {
      const result = originalTranslate(key, options);
      
      // Always return a string, never an object
      if (result === null || result === undefined) {
        return options.defaultValue || key;
      }
      
      if (typeof result === 'object') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Translation key "${key}" returned an object instead of a string:`, result);
        }
        return options.defaultValue || key;
      }
      
      return String(result);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[i18n] Error translating key "${key}":`, error);
      }
      return options.defaultValue || key;
    }
  };
};

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
  const translation = t(key, options);
  return toSafeString(translation, key);
}; 