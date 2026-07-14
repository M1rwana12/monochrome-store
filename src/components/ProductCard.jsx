import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/catalog'

export default function ProductCard({ product }) {
  const [main, alt] = product.images
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
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2 text-sm">
        <span>{product.name}</span>
        <span className="text-mist shrink-0">{formatPrice(product.price)}</span>
      </div>
    </Link>
  )
}
