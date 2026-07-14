import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import products from '../data/products.json'
import { formatPrice } from '../utils/catalog'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const product = products.find(p => p.id === id)
  useDocumentTitle(product ? product.name : 'Not found')
  const { addItem } = useCart()
  const [size, setSize] = useState<string | null>(() =>
    product && product.sizes.length === 1 ? product.sizes[0] : null,
  )
  const [error, setError] = useState(false)
  const [lastId, setLastId] = useState(id)

  // Reset selection when navigating between products (adjust-state-during-render pattern)
  if (id !== lastId) {
    setLastId(id)
    setSize(product && product.sizes.length === 1 ? product.sizes[0] : null)
    setError(false)
  }

  if (!product) {
    return (
      <div className="pt-40 text-center">
        <p className="font-display text-2xl uppercase tracking-widest">Not found</p>
        <Link to="/catalog" className="text-mist text-sm underline underline-offset-4 mt-4 inline-block">
          Back to catalog
        </Link>
      </div>
    )
  }

  const related = [
    ...products.filter(p => p.category === product.category && p.id !== product.id),
    ...products.filter(p => p.category !== product.category),
  ].slice(0, 4)

  const add = () => {
    if (!size) return setError(true)
    addItem(product.id, size)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          {product.images.map(src => (
            <img key={src} src={src} alt={product.name} loading="lazy" className="w-full aspect-[3/4] object-cover bg-coal" />
          ))}
        </div>

        <div className="md:sticky md:top-28 self-start">
          <Reveal>
            {product.isNew && <span className="text-[10px] uppercase tracking-widest bg-paper text-ink px-2 py-1">New</span>}
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide mt-4">{product.name}</h1>
            <p className="mt-2 text-xl text-mist">{formatPrice(product.price)}</p>
            <p className="mt-6 text-sm leading-relaxed text-paper/80 max-w-md">{product.description}</p>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-mist mb-3">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setError(false) }}
                    className={`min-w-12 px-3 py-3 border text-sm cursor-pointer transition-colors ${
                      size === s ? 'border-paper bg-paper text-ink' : 'border-white/20 hover:border-paper'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {error && <p className="mt-2 text-xs text-red-400 uppercase tracking-widest">Select a size first</p>}
            </div>

            <button onClick={add} className="mt-8 w-full sm:w-80 bg-paper text-ink py-4 uppercase tracking-[0.3em] text-xs hover:bg-mist transition-colors cursor-pointer">
              Add to cart — {formatPrice(product.price)}
            </button>
          </Reveal>
        </div>
      </div>

      <section className="mt-24">
        <Reveal>
          <h2 className="font-display text-xl uppercase tracking-widest mb-8">Wear it with</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  )
}
