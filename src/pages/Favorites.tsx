import { Link } from 'react-router-dom'
import products from '../data/products.json'
import { useFavorites } from '../context/FavoritesContext'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useLocale from '../hooks/useLocale'
import type { Product } from '../types'

export default function Favorites() {
  const { t, localePath } = useLocale()
  useDocumentTitle(t('favorites.title'))
  const { ids } = useFavorites()
  const saved: Product[] = ids.flatMap(id => {
    const product = products.find(p => p.id === id)
    return product ? [product] : []
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
      <Reveal>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest">{t('favorites.title')}</h1>
      </Reveal>

      {saved.length === 0 ? (
        <div className="mt-16 text-center space-y-6">
          <p className="text-mist">{t('favorites.empty')}</p>
          <Link
            to={localePath('/catalog')}
            className="inline-block border border-white/20 px-8 py-3 uppercase tracking-[0.3em] text-xs hover:border-paper transition-colors"
          >
            {t('favorites.browse')}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {saved.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
