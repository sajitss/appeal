import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import commonEn from '../../public/locales/en/common.json';
import commonHi from '../../public/locales/hi/common.json';
import commonKn from '../../public/locales/kn/common.json';

const isClient = typeof window !== 'undefined';

if (isClient) {
    i18n
        .use(LanguageDetector)
}

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: commonEn },
            hi: { common: commonHi },
            kn: { common: commonKn },
        },
        fallbackLng: 'en',
        ns: ['common'],
        defaultNS: 'common',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
