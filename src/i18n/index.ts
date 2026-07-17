import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uk from './uk.json'
import en from './en.json'

export type Lang = 'uk' | 'en'

// Detect initial language from the URL so the first paint is already correct
const initialLang: Lang =
  typeof window !== 'undefined' &&
  (window.location.pathname === '/en' || window.location.pathname.startsWith('/en/'))
    ? 'en'
    : 'uk'

void i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: 'uk',
  interpolation: { escapeValue: false },
})

export default i18n
