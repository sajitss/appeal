import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const isClient = typeof window !== 'undefined';

if (isClient) {
    i18n
        .use(Backend)
        .use(LanguageDetector)
}

i18n
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        load: 'languageOnly', // Fixes en-AU searching for en-AU
        ns: ['common'],
        defaultNS: 'common',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        // Prevent server-side loading attempts if backend is not used, 
        // but since we conditonally .use(Backend), this config is ignored on server.
    });

export default i18n;
