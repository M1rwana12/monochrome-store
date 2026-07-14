import { useSearchParams } from 'react-router-dom'
import products from '../data/products.json'
import { filterProducts, sortProducts } from '../utils/catalog'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import useDocumentTitle from '../hooks/useDocumentTitle'

const CATEGORIES = ['all', 'outerwear', 'hoodies', 'tees', 'pants', 'accessories']
const SIZES = ['all', 'S', 'M', 'L', 'XL', 'ONE']
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

export default function Catalog() {
  useDocumentTitle('Catalog')
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'all'
  const size = params.get('size') || 'all'
  const max = params.get('max') || ''
  const sort = params.get('sort') || 'new'

  const setParam = (key, value, defaultValue) => {
    const next = new URLSearchParams(params)
    if (!value || value === defaultValue) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const shown = sortProducts(
    filterProducts(products, { category, size, maxPrice: max ? Number(max) : null }),
    sort,
  )

  const selectCls = 'bg-ink border border-white/20 px-3 py-2 text-xs uppercase tracking-widest focus:border-paper outline-none cursor-pointer'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
      <Reveal>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest">Catalog</h1>
      </Reveal>

      <div className="mt-8 flex flex-wrap gap-3 items-center">
        <select aria-label="Category" value={category} onChange={e => setParam('category', e.target.value, 'all')} className={selectCls}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
        <select aria-label="Size" value={size} onChange={e => setParam('size', e.target.value, 'all')} className={selectCls}>
          {SIZES.map(s => <option key={s} value={s}>{s === 'all' ? 'All sizes' : s}</option>)}
        </select>
        <select aria-label="Max price" value={max} onChange={e => setParam('max', e.target.value, '')} className={selectCls}>
          {PRICES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={e => setParam('sort', e.target.value, 'new')} className={`${selectCls} ml-auto`}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <p className="mt-6 text-xs text-mist uppercase tracking-widest">{shown.length} items</p>

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
