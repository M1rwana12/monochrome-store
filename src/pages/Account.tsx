import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiMyOrders } from '../utils/account'
import { formatMoney } from '../utils/money'
import { levelFor, nextLevel } from '../utils/bonus'
import type { Order } from '../utils/orders'
import Reveal from '../components/Reveal'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useLocale from '../hooks/useLocale'

type Mode = 'login' | 'register'

export default function Account() {
  const { lang, t } = useLocale()
  useDocumentTitle(t('account.title'))
  const { user, loading, login, register, logout } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- simple reset on logout
      setOrders(null)
      return
    }
    let cancelled = false
    apiMyOrders()
      .then(list => {
        if (!cancelled) setOrders(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '')
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, name)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401) setError(t('account.errWrongCredentials'))
      else if (status === 409) setError(t('account.errEmailTaken'))
      else if (status === 400) setError(t('account.errInvalid'))
      else setError(t('account.errGeneric'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="pt-40 min-h-svh" aria-hidden="true" />
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-sm px-4 pt-36 pb-24">
        <h1 className="font-display text-2xl uppercase tracking-widest text-center">{t('account.title')}</h1>
        <div className="mt-8 flex border border-white/20 text-xs uppercase tracking-widest">
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null) }}
              className={`flex-1 py-3 cursor-pointer transition-colors ${mode === m ? 'bg-paper text-ink' : 'hover:text-mist'}`}
            >
              {t(`account.${m}`)}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <label className="block text-xs uppercase tracking-widest text-mist">
              {t('account.name')}
              <input name="name" type="text" required
                className="mt-2 w-full bg-transparent border border-white/20 p-3 text-paper text-sm focus:border-paper outline-none" />
            </label>
          )}
          <label className="block text-xs uppercase tracking-widest text-mist">
            Email
            <input name="email" type="email" required autoComplete="email"
              className="mt-2 w-full bg-transparent border border-white/20 p-3 text-paper text-sm focus:border-paper outline-none" />
          </label>
          <label className="block text-xs uppercase tracking-widest text-mist">
            {t('account.password')}
            <input name="password" type="password" required minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="mt-2 w-full bg-transparent border border-white/20 p-3 text-paper text-sm focus:border-paper outline-none" />
          </label>
          {error && <p className="text-xs text-red-400 uppercase tracking-widest">{error}</p>}
          <button
            disabled={busy}
            className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer disabled:opacity-50"
          >
            {busy ? '…' : t(`account.${mode}`)}
          </button>
          {mode === 'register' && (
            <p className="text-xs text-mist">{t('account.registerBonus')}</p>
          )}
        </form>
      </div>
    )
  }

  const level = levelFor(user.totalSpentUsd)
  const next = nextLevel(user.totalSpentUsd)

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-16">
      <Reveal>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl uppercase tracking-widest">{t('account.title')}</h1>
          <button
            onClick={() => void logout()}
            className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-mist hover:border-paper hover:text-paper transition-colors cursor-pointer"
          >
            {t('account.logout')}
          </button>
        </div>

        <p className="mt-2 text-sm text-mist">{user.name} · {user.email}</p>

        <div className="mt-8 border border-white/15 bg-coal p-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <span className="font-display uppercase tracking-[0.3em]">MONO CLUB</span>
            <span
              className={`text-[10px] uppercase tracking-widest px-2 py-1 ${
                level.name === 'black' ? 'bg-paper text-ink' : 'border border-white/30'
              }`}
            >
              {t(`account.level.${level.name}`)} · {Math.round(level.rate * 100)}%
            </span>
          </div>
          <p className="mt-4 text-3xl font-display">{user.points.toLocaleString('uk-UA')} <span className="text-sm text-mist">{t('account.points')}</span></p>
          {next && (
            <p className="mt-2 text-xs text-mist">
              {t('account.toNextLevel', {
                amount: formatMoney(next.remainingUsd, lang),
                level: t(`account.level.${next.level.name}`),
              })}
            </p>
          )}
        </div>

        <h2 className="mt-12 font-display text-xl uppercase tracking-widest">{t('account.myOrders')}</h2>
        {orders && orders.length === 0 && <p className="mt-4 text-mist text-sm">{t('account.noOrders')}</p>}
        <div className="mt-4 space-y-4">
          {orders?.map(order => (
            <div key={order.id} className="border border-white/10 bg-coal p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-display tracking-widest">{order.id}</span>
                <span className="text-xs text-mist">{new Date(order.createdAt).toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-GB')}</span>
                <span
                  className={`text-[10px] uppercase tracking-widest px-2 py-1 ${
                    order.status === 'new' ? 'bg-paper text-ink' : 'border border-white/20 text-mist'
                  }`}
                >
                  {t(`account.status.${order.status}`)}
                </span>
                <span className="ml-auto text-sm">{formatMoney(order.total, lang)}</span>
              </div>
              <div className="mt-3 text-sm text-paper/80">
                {order.items.map(i => (
                  <div key={`${i.id}-${i.size}`}>
                    {i.name} ({i.size}) ×{i.qty}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
