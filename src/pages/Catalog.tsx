import { useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import products from '../data/products.json'
import { filterProducts, sortProducts } from '../utils/catalog'
import { getEmbedder, productText, rankBySimilarity, type Embedding } from '../utils/semantic'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import Select from '../components/Select'
import useDocumentTitle from '../hooks/useDocumentTitle'

const CATEGORIES = [
  { value: 'all', label: 'All categories' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'tees', label: 'Tees' },
  { value: 'pants', label: 'Pants' },
  { value: 'accessories', label: 'Accessories' },
]
const SIZES = [
  { value: 'all', label: 'All sizes' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'ONE', label: 'ONE' },
]
const PRICES = [
  { value: '', label: 'Any price' },
  { value: '50', label: 'Under $50' },
  { value: '100', label: 'Under $100' },
  { value: '150', label: 'Under $150' },
]
const SORTS = [
  { value: 'new', label: 'New first' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
]

type AiStatus = 'idle' | 'loading' | 'ready' | 'error'

export default function Catalog() {
  useDocumentTitle('Catalog')
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'all'
  const size = params.get('size') || 'all'
  const max = params.get('max') || ''
  const sort = params.get('sort') || 'new'

  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')
  const [aiQuery, setAiQuery] = useState('')
  const [aiScores, setAiScores] = useState<Map<string, number> | null>(null)
  const [searching, setSearching] = useState(false)
  const catalogEmbeddings = useRef<Embedding[] | null>(null)

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
      catalogEmbeddings.current ??= await embed(products.map(productText))
      setAiStatus('ready')
      const [queryEmbedding] = await embed([q])
      const ranked = rankBySimilarity(products, catalogEmbeddings.current, queryEmbedding)
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
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest">Catalog</h1>
      </Reveal>

      <form onSubmit={runSearch} className="mt-8">
        <div className="flex flex-wrap gap-2">
          <input
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onFocus={prewarm}
            placeholder='AI search — try "something warm for a cold evening"'
            aria-label="AI search"
            className="flex-1 min-w-60 bg-transparent border border-white/20 px-4 py-3 text-sm focus:border-paper outline-none placeholder:text-mist/60"
          />
          <button
            type="submit"
            disabled={searching}
            className="border border-white/20 px-5 py-3 text-xs uppercase tracking-widest hover:border-paper transition-colors cursor-pointer disabled:opacity-50"
          >
            {searching ? 'Thinking…' : 'Search'}
          </button>
          {aiScores && (
            <button
              type="button"
              onClick={clearSearch}
              className="border border-white/20 px-5 py-3 text-xs uppercase tracking-widest text-mist hover:border-paper hover:text-paper transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-mist uppercase tracking-widest" aria-live="polite">
          {aiStatus === 'loading' && 'Loading on-device AI model (~25 MB, first time only)…'}
          {aiStatus === 'error' && 'AI search unavailable right now — filters still work.'}
          {(aiStatus === 'idle' || aiStatus === 'ready') &&
            'Semantic search — a neural network runs entirely in your browser'}
        </p>
      </form>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <Select label="Category" value={category} options={CATEGORIES} onChange={v => setParam('category', v, 'all')} />
        <Select label="Size" value={size} options={SIZES} onChange={v => setParam('size', v, 'all')} />
        <Select label="Max price" value={max} options={PRICES} onChange={v => setParam('max', v, '')} />
        <div className="ml-auto">
          <Select label="Sort" value={sort} options={SORTS} onChange={v => setParam('sort', v, 'new')} alignRight />
        </div>
      </div>

      <p className="mt-6 text-xs text-mist uppercase tracking-widest">
        {shown.length} items{aiScores ? ' · ranked by AI relevance' : ''}
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
          <p className="text-mist">Nothing matches these filters.</p>
          <button
            onClick={() => setParams({}, { replace: true })}
            className="border border-white/20 px-8 py-3 uppercase tracking-[0.3em] text-xs hover:border-paper transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
