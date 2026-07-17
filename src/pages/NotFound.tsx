import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('404')
  return (
    <div className="pt-40 pb-24 text-center px-6">
      <p className="font-display text-6xl sm:text-8xl tracking-[0.2em]">404</p>
      <p className="mt-4 text-mist uppercase tracking-[0.4em] text-xs">Page not found</p>
      <Link
        to="/"
        className="mt-10 inline-block border border-white/20 px-8 py-3 uppercase tracking-[0.3em] text-xs hover:border-paper transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
