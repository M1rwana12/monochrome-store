import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Lang } from '../i18n'

// English lives under /en/*; Ukrainian is the default locale at the root.
export default function useLocale() {
  const { pathname, search, hash } = useLocation()
  const { t } = useTranslation()
  const isEn = pathname === '/en' || pathname.startsWith('/en/')
  const lang: Lang = isEn ? 'en' : 'uk'

  const localePath = (path: string) => (isEn ? (path === '/' ? '/en' : `/en${path}`) : path)

  const pathInLang = (target: Lang) => {
    const bare = isEn ? pathname.replace(/^\/en/, '') || '/' : pathname
    const path = target === 'en' ? (bare === '/' ? '/en' : `/en${bare}`) : bare
    return `${path}${search}${hash}`
  }

  return { lang, isEn, t, localePath, pathInLang }
}
