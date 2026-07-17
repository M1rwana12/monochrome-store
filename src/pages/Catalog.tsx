import { useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import products from '../data/products.json'
import { filterProducts, sortProducts } from '../utils/catalog'
import { formatMoney } from '../utils/money'
import { getEmbedder, productText, rankBySimilarity, type Embedding } from '../utils/semantic'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import Select from '../components/Select'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useLocale from '../hooks/useLocale'
import type { Lang } from '../i18n'

type AiStatus = 'idle' | 'loading' | 'ready' | 'error'

export default function Catalog() {
  const { lang, t } = useLocale()
  useDocumentTitle(t('catalog.title'))
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'all'
  const size = params.get('size') || 'all'
  const max = params.get('max') || ''
  const sort = params.get('sort') || 'new'

  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')
  const [aiQuery, setAiQuery] = useState('')
  const [aiScores, setAiScores] = useState<Map<string, number> | null>(null)
  const [searching, setSearching] = useState(false)
  const catalogEmbeddings = useRef<Partial<Record<Lang, Embedding[]>>>({})

  const CATEGORIES = [
    { value: 'all', label: t('catalog.allCategories') },
    { value: 'outerwear', label: t('categories.outerwear') },
    { value: 'hoodies', label: t('categories.hoodies') },
    { value: 'tees', label: t('categories.tees') },
    { value: 'pants', label: t('categories.pants') },
    { value: 'accessories', label: t('categories.accessories') },
  ]
  const SIZES = [
    { value: 'all', label: t('catalog.allSizes') },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'ONE', label: 'ONE' },
  ]
  const PRICES = [
    { value: '', label: t('catalog.anyPrice') },
    { value: '50', label: t('catalog.under', { price: formatMoney(50, lang) }) },
    { value: '100', label: t('catalog.under', { price: formatMoney(100, lang) }) },
    { value: '150', label: t('catalog.under', { price: formatMoney(150, lang) }) },
  ]
  const SORTS = [
    { value: 'new', label: t('catalog.sortNew') },
    { value: 'price-asc', label: t('catalog.priceAsc') },
    { value: 'price-desc', label: t('catalog.priceDesc') },
  ]

  const setParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === defaultValue) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  // Start downloading the model as soon as the user shows intent
  const prewarm = () => {
    void getEmbedder().catch(() => {})
  }

  const runSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = aiQuery.trim()
    if (!q) {
      setAiScores(null)
      return
    }
    setSearching(true)
    setAiStatus(s => (s === 'ready' ? s : 'loading'))
    try {
      const embed = await getEmbedder()
      catalogEmbeddings.current[lang] ??= await embed(products.map(p => productText(p, lang)))
      setAiStatus('ready')
      const [queryEmbedding] = await embed([q])
      const ranked = rankBySimilarity(products, catalogEmbeddings.current[lang]!, queryEmbedding)
      setAiScores(new Map(ranked.map(r => [r.item.id, r.score])))
    } catch {
      setAiStatus('error')
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setAiScores(null)
    setAiQuery('')
  }

  const filtered = filterProducts(products, { category, size, maxPrice: max ? Number(max) : null })
  const shown = aiScores
    ? [...filtered].sort((a, b) => (aiScores.get(b.id) ?? 0) - (aiScores.get(a.id) ?? 0))
    : sortProducts(filtered, sort)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
      <Reveal>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest">{t('catalog.title')}</h1>
      </Reveal>

      <form onSubmit={runSearch} className="mt-8">
        <div className="flex flex-wrap gap-2">
          <input
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onFocus={prewarm}
            placeholder={t('catalog.aiPlaceholder')}
            aria-label={t('catalog.aiAria')}
            className="flex-1 min-w-60 bg-transparent border border-white/20 px-4 py-3 text-sm focus:border-paper outline-none placeholder:text-mist/60"
          />
          <button
            type="submit"
            disabled={searching}
            className="border border-white/20 px-5 py-3 text-xs uppercase tracking-widest hover:border-paper transition-colors cursor-pointer disabled:opacity-50"
          >
            {searching ? t('catalog.thinking') : t('catalog.search')}
          </button>
          {aiScores && (
            <button
              type="button"
              onClick={clearSearch}
              className="border border-white/20 px-5 py-3 text-xs uppercase tracking-widest text-mist hover:border-paper hover:text-paper transition-colors cursor-pointer"
            >
              {t('catalog.clear')}
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-mist uppercase tracking-widest" aria-live="polite">
          {aiStatus === 'loading' && t('catalog.aiLoading')}
          {aiStatus === 'error' && t('catalog.aiError')}
          {(aiStatus === 'idle' || aiStatus === 'ready') && t('catalog.aiHintIdle')}
        </p>
      </form>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <Select label={t('catalog.category')} value={category} options={CATEGORIES} onChange={v => setParam('category', v, 'all')} />
        <Select label={t('catalog.size')} value={size} options={SIZES} onChange={v => setParam('size', v, 'all')} />
        <Select label={t('catalog.maxPrice')} value={max} options={PRICES} onChange={v => setParam('max', v, '')} />
        <div className="ml-auto">
          <Select label={t('catalog.sort')} value={sort} options={SORTS} onChange={v => setParam('sort', v, 'new')} alignRight />
        </div>
      </div>

      <p className="mt-6 text-xs text-mist uppercase tracking-widest">
        {t('catalog.items', { count: shown.length })}
        {aiScores ? t('catalog.rankedByAi') : ''}
      </p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {shown.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="mt-16 text-center space-y-6">
          <p className="text-mist">{t('catalog.nothing')}</p>
          <button
            onClick={() => setParams({}, { replace: true })}
            className="border border-white/20 px-8 py-3 uppercase tracking-[0.3em] text-xs hover:border-paper transition-colors cursor-pointer"
          >
            {t('catalog.clearFilters')}
          </button>
        </div>
      )}
    </div>
  )
}
