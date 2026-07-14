import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/catalog'
import { useFavorites } from '../context/FavoritesContext'
import type { Product } from '../types'

export default function ProductCard({ product }: { product: Product }) {
  const [main, alt] = product.images
  const { has, toggle } = useFavorites()
  const saved = has(product.id)

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-coal">
        <img
          src={main} alt={product.name} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {alt && (
          <img
            src={alt} alt="" loading="lazy" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-paper text-ink text-[10px] uppercase tracking-widest px-2 py-1">
            New
          </span>
        )}
        <button
          onClick={e => {
            e.preventDefault()
            toggle(product.id)
          }}
          aria-label={saved ? 'Remove from saved' : 'Save item'}
          aria-pressed={saved}
          className={`absolute top-2 right-2 p-2 cursor-pointer transition-colors ${
            saved ? 'text-paper' : 'text-paper/50 hover:text-paper'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2 text-sm">
        <span>{product.name}</span>
        <span className="text-mist shrink-0">{formatPrice(product.price)}</span>
      </div>
    </Link>
  )
}
