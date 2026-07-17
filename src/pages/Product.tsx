import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import products from '../data/products.json'
import { formatPrice } from '../utils/catalog'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import SkeletonImage from '../components/SkeletonImage'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { SITE_URL } from '../config'

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
  const [lightbox, setLightbox] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()

  // Reset selection when navigating between products (adjust-state-during-render pattern)
  if (id !== lastId) {
    setLastId(id)
    setSize(product && product.sizes.length === 1 ? product.sizes[0] : null)
    setError(false)
  }

  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lightbox])

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(src => `${SITE_URL}${src}`),
    brand: { '@type': 'Brand', name: 'MONOCHROME' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.id}`,
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
      {/* Static catalog data only; "<" is escaped to prevent </script> breakout */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          {product.images.map(src => (
            <button
              key={src}
              onClick={() => setLightbox(src)}
              className="relative block w-full aspect-[3/4] overflow-hidden bg-coal cursor-zoom-in"
              aria-label={`Zoom ${product.name} photo`}
            >
              <SkeletonImage
                src={src} alt={product.name} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
          {product.hoverVideo && (
            <video
              src={product.hoverVideo}
              poster={product.images[0]}
              autoPlay={!reduceMotion} muted loop playsInline preload="metadata"
              className="w-full aspect-[3/4] object-cover bg-coal"
              aria-label={`${product.name} in motion`}
            />
          )}
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

      <AnimatePresence>
        {lightbox && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
            onClick={() => setLightbox(null)}
            role="dialog" aria-modal="true" aria-label="Image preview"
          >
            <img src={lightbox} alt={product.name} className="max-h-full max-w-full object-contain" />
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close preview"
              className="absolute top-6 right-6 text-mist hover:text-paper text-xl cursor-pointer"
            >
              ✕
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
