import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { averageRating, fetchReviews, postReview, type Review } from '../utils/reviews'
import seedData from '../data/reviews.json'
import useLocale from '../hooks/useLocale'
import Stars from './Stars'

const SEED: Record<string, Review[]> = seedData

export default function Reviews({ productId }: { productId: string }) {
  const { lang, t } = useLocale()
  const { user } = useAuth()
  const [live, setLive] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchReviews(productId)
      .then(list => {
        if (!cancelled) setLive(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [productId])

  const all = useMemo(() => [...live, ...(SEED[productId] ?? [])], [live, productId])
  const avg = averageRating(all)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      const review = await postReview(productId, rating, text.trim())
      setLive(prev => [review, ...prev])
      setText('')
      setSent(true)
    } catch {
      // keep the form as is; user can retry
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="mt-24">
      <div className="flex items-baseline gap-4 flex-wrap">
        <h2 className="font-display text-xl uppercase tracking-widest">{t('reviews.title')}</h2>
        {all.length > 0 && (
          <>
            <Stars value={avg} ariaLabel={t('reviews.ratingAria', { count: avg })} />
            <span className="text-xs text-mist">{avg} · {t('reviews.count', { count: all.length })}</span>
          </>
        )}
      </div>

      {all.length === 0 && <p className="mt-4 text-sm text-mist">{t('reviews.empty')}</p>}

      <div className="mt-6 space-y-5 max-w-2xl">
        {all.map(review => (
          <div key={review.id} className="border border-white/10 bg-coal p-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm">{review.name}</span>
              <Stars value={review.rating} ariaLabel={t('reviews.ratingAria', { count: review.rating })} />
              <span className="text-xs text-mist ml-auto">
                {new Date(review.createdAt).toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-GB')}
              </span>
            </div>
            <p className="mt-2 text-sm text-paper/80 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-2xl">
        {user ? (
          sent ? (
            <p className="text-sm text-paper">{t('reviews.thanks')}</p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-mist">{t('reviews.write')}</p>
              <Stars value={rating} onChange={setRating} ariaLabel={t('reviews.write')} />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={t('reviews.placeholder')}
                rows={3}
                maxLength={500}
                className="w-full bg-transparent border border-white/20 p-3 text-paper text-sm focus:border-paper outline-none placeholder:text-mist/60"
              />
              <button
                disabled={sending || !text.trim()}
                className="border border-white/20 px-6 py-2.5 text-xs uppercase tracking-widest hover:border-paper transition-colors cursor-pointer disabled:opacity-40"
              >
                {sending ? '…' : t('reviews.submit')}
              </button>
            </form>
          )
        ) : (
          <Link to="/account" className="text-xs uppercase tracking-widest text-mist border-b border-mist/40 pb-0.5 hover:text-paper transition-colors">
            {t('reviews.loginToReview')}
          </Link>
        )}
      </div>
    </section>
  )
}
