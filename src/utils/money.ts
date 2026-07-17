import type { Lang } from '../i18n'

// Demo FX rate; product data stores USD prices.
export const UAH_RATE = 42

export function priceValue(usd: number, lang: Lang) {
  return lang === 'uk' ? usd * UAH_RATE : usd
}

export function formatMoney(usd: number, lang: Lang) {
  if (lang === 'uk') return `${(usd * UAH_RATE).toLocaleString('uk-UA')} ₴`
  return `$${usd}`
}
