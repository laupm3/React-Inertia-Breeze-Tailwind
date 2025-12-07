import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cache from 'i18next-localstorage-cache';
import Backend from 'i18next-http-backend';

import Languages from '@/Shared/Languages';

// Get stored language from localStorage or use browser language
const getStoredLanguage = () => {
  const storedLang = localStorage.getItem('i18nextLng');
  return storedLang || navigator.language.split('-')[0]; // Fallback to browser language
};

i18n
  .use(Backend)
  .use(Cache)
  .use(initReactI18next) // Integra i18next con React
  .init({
    lng: getStoredLanguage(), // Use stored/detected language
    fallbackLng: 'en', // Idioma sino se encuentra el idioma por defecto
    debug: false,
    languages: Languages.map(language => language.cultural_configuration),
    ns: [], // Nombres de los archivos de traducción,
    cache: {
      enabled: true,
      prefix: 'i18next_res_',
      expirationTime: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
