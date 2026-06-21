'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { SUPPORTED_LOCALES, RTL_CODES } from '@/lib/configs'

interface I18nContextType {
  locale: string
  translate: (key: string, params?: Record<string, string>) => string
  dir: 'ltr' | 'rtl'
  setLocale: (locale: string) => void
  translations: Record<string, any>
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  translate: (key: string) => key,
  dir: 'ltr',
  setLocale: () => {},
  translations: {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState('en')
  const [translations, setTranslations] = useState<Record<string, any>>({})

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0]
    const detected = SUPPORTED_LOCALES.includes(browserLang) ? browserLang : 'en'
    setLocaleState(detected)
    loadTranslations(detected)
  }, [])

  const loadTranslations = useCallback(async (localeCode: string) => {
    try {
      const res = await fetch(`/locales/${localeCode}.json`)
      if (res.ok) {
        const data: Record<string, any> = await res.json()
        setTranslations(data)
        document.documentElement.lang = localeCode
        document.documentElement.dir = RTL_CODES.has(localeCode) ? 'rtl' : 'ltr'
      }
    } catch (e) {
      console.warn('Failed to load translations:', e)
    }
  }, [])

  const translate = useCallback((key: string, params?: Record<string, string>): string => {
    const keys = key.split('.')
    let value: any = translations
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }
    if (value === undefined || value === null) return key
    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey: string) =>
        params[paramKey] !== undefined ? params[paramKey] : _
      )
    }
    return String(value)
  }, [translations])

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale)
    loadTranslations(newLocale)
  }, [loadTranslations])

  const dir = RTL_CODES.has(locale) ? 'rtl' : 'ltr'

  return (
    <I18nContext.Provider value={{ locale, translate, dir, setLocale, translations }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
