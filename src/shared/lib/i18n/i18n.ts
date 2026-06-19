import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { setGraphqlLanguage } from '../graphqlClient'
import de from './locales/de.json'
import en from './locales/en.json'

/** Supported language codes. */
export const SUPPORTED_LANGUAGES = ['en', 'de'] as const

/**
 * Keeps the `<html lang>` attribute in sync with the active i18next language.
 * @param lng - The BCP 47 language tag to set on the document element.
 */
const syncDocumentLang = (lng: string) => {
  document.documentElement.lang = lng
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'p1ng-language',
    },
  })

syncDocumentLang(i18n.language)
i18n.on('languageChanged', syncDocumentLang)

setGraphqlLanguage(i18n.language)
i18n.on('languageChanged', setGraphqlLanguage)

export default i18n
