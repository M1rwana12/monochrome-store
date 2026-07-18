import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import useLocale from '../hooks/useLocale'

export default function Header() {
  const { count, openCart } = useCart()
  const { count: savedCount } = useFavorites()
  const { lang, t, localePath, pathInLang } = useLocale()

  const nav = [
    { to: localePath('/catalog'), label: t('nav.catalog') },
    { to: localePath('/lookbook'), label: t('nav.lookbook') },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-40 mix-blend-difference text-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to={localePath('/')} className="font-display font-bold tracking-[0.15em] sm:tracking-[0.3em] text-sm sm:text-lg">
          MONOCHROME
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-[11px] sm:text-sm uppercase tracking-wider sm:tracking-widest">
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              className={({ isActive }) =>
                `hover:opacity-60 transition-opacity ${isActive ? 'underline underline-offset-8' : ''}`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <NavLink
            to={localePath('/favorites')}
            aria-label={t('nav.savedAria')}
            className={({ isActive }) =>
              `flex items-center gap-1 hover:opacity-60 transition-opacity ${isActive ? 'underline underline-offset-8' : ''}`
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {savedCount > 0 && <span>{savedCount}</span>}
          </NavLink>
          <NavLink
            to={localePath('/account')}
            aria-label={t('account.aria')}
            className={({ isActive }) =>
              `hover:opacity-60 transition-opacity ${isActive ? 'underline underline-offset-8' : ''}`
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5z" />
            </svg>
          </NavLink>
          <button
            onClick={openCart}
            className="hover:opacity-60 transition-opacity cursor-pointer uppercase tracking-wider sm:tracking-widest"
          >
            {t('nav.cart')} ({count})
          </button>
          <Link
            to={pathInLang(lang === 'uk' ? 'en' : 'uk')}
            aria-label={lang === 'uk' ? 'Switch to English' : 'Перейти на українську'}
            className="border border-current px-1.5 py-0.5 text-[10px] sm:text-xs hover:opacity-60 transition-opacity"
          >
            {lang === 'uk' ? 'EN' : 'UA'}
          </Link>
        </nav>
      </div>
    </header>
  )
}
