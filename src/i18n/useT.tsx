import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Language } from '../lib/types'
import { translations, type TranslationKey } from './strings'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const STORAGE_KEY = 'tender_app_lang'

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const qLang = params.get('lang')
      if (qLang === 'en' || qLang === 'bn') return qLang

      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'en' || saved === 'bn') return saved
    } catch {
      // ignore
    }
    return 'en'
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore
    }
    // Update document HTML lang attribute
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (lang: Language) => setLanguageState(lang)
  const toggleLanguage = () =>
    setLanguageState((curr) => (curr === 'en' ? 'bn' : 'en'))

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let str: string = translations[language][key] ?? translations.en[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return str
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useT must be used within an I18nProvider')
  }
  return ctx
}
