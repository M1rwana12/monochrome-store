import { useSearchParams } from 'react-router-dom'
import products from '../data/products.json'
import { filterProducts, sortProducts } from '../utils/catalog'
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

export default function Catalog() {
  useDocumentTitle('Catalog')
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'all'
  const size = params.get('size') || 'all'
  const max = params.get('max') || ''
  const sort = params.get('sort') || 'new'

  const setParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === defaultValue) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const shown = sortProducts(
    filterProducts(products, { category, size, maxPrice: max ? Number(max) : null }),
    sort,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
      <Reveal>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest">Catalog</h1>
      </Reveal>

      <div className="mt-8 flex flex-wrap gap-3 items-center">
        <Select label="Category" value={category} options={CATEGORIES} onChange={v => setParam('category', v, 'all')} />
        <Select label="Size" value={size} options={SIZES} onChange={v => setParam('size', v, 'all')} />
        <Select label="Max price" value={max} options={PRICES} onChange={v => setParam('max', v, '')} />
        <div className="ml-auto">
          <Select label="Sort" value={sort} options={SORTS} onChange={v => setParam('sort', v, 'new')} alignRight />
        </div>
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
