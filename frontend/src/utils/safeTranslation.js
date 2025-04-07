import { useTranslation } from 'react-i18next';
import React from 'react';
import { toSafeString } from './translationHelper';

/**
 * A safer version of useTranslation that ensures translations are always strings
 * to prevent React Error #31: "Objects are not valid as React children"
 */
export const useSafeTranslation = () => {
  const { t, i18n, ready } = useTranslation();
  
  // Create a safe wrapper for the t function
  const safeT = React.useCallback((key, options) => {
    // Handle case where key is not a string
    if (!key || typeof key !== 'string') {
      return '';
    }
    
    try {
      const translation = t(key, options);
      return toSafeString(translation, key);
    } catch (error) {
      // Handle any errors in the translation process
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error translating key '${key}':`, error);
      }
      
      // Safely extract fallback from key
      return key ? (key.split('.').pop() || String(key)) : '';
    }
  }, [t]);
  
  return { t: safeT, i18n, ready };
};

/**
 * Higher-order component that wraps a component with safe translation handling
 */
export const withSafeTranslation = (Component) => {
  return (props) => {
    const { t, i18n, ready } = useSafeTranslation();
    return <Component {...props} t={t} i18n={i18n} tReady={ready} />;
  };
};

/**
 * A React component that safely renders translations
 * Use this instead of the Trans component when you have concerns about object rendering
 */
export const SafeTrans = ({ i18nKey, values, components, fallback = '' }) => {
  const { t } = useSafeTranslation();
  
  try {
    const content = t(i18nKey, { ...values });
    return <>{toSafeString(content, fallback)}</>;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in SafeTrans for key '${i18nKey}':`, error);
    }
    return <>{fallback || i18nKey || ''}</>;
  }
};

/**
 * A utility function that safely converts any translation to a string
 */
export const ensureString = (translation, fallback = '') => {
  if (translation === null || translation === undefined) {
    return fallback;
  }
  
  if (typeof translation === 'object') {
    return fallback;
  }
  
  return String(translation);
}; 