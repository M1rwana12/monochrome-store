import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const nav = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/lookbook', label: 'Lookbook' },
]

export default function Header() {
  const { count, openCart } = useCart()
  return (
    <header className="fixed top-0 inset-x-0 z-40 mix-blend-difference text-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-bold tracking-[0.15em] sm:tracking-[0.3em] text-sm sm:text-lg">
          MONOCHROME
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-[11px] sm:text-sm uppercase tracking-wider sm:tracking-widest">
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `hover:opacity-60 transition-opacity ${isActive ? 'underline underline-offset-8' : ''}`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <button
            onClick={openCart}
            className="hover:opacity-60 transition-opacity cursor-pointer uppercase tracking-widest"
            aria-label="Open cart"
          >
            Cart ({count})
          </button>
        </nav>
      </div>
    </header>
  )
}
