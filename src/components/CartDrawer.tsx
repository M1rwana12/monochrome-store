import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { cartTotal } from '../utils/catalog'
import { formatMoney } from '../utils/money'
import { buildOrderItems, submitOrder, validatePromo } from '../utils/orders'
import useLocale from '../hooks/useLocale'
import products from '../data/products.json'
import { TELEGRAM_BOT } from '../config'

type Stage = 'cart' | 'checkout' | 'done'

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, removeItem, clear } = useCart()
  const { lang, t } = useLocale()
  const [stage, setStage] = useState<Stage>('cart')
  const [sending, setSending] = useState(false)
  const [orderError, setOrderError] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code: string; rate: number } | null>(null)
  const [promoError, setPromoError] = useState(false)
  const subtotal = cartTotal(items, products)
  const discount = promo ? Math.round(subtotal * promo.rate) : 0
  const total = subtotal - discount
  const asideRef = useRef<HTMLElement>(null)

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoError(false)
    try {
      const rate = await validatePromo(code)
      if (rate === null) setPromoError(true)
      else setPromo({ code, rate })
    } catch {
      setPromoError(true)
    }
  }

  const FIELDS = [
    { name: 'name', label: t('cart.name'), type: 'text' },
    { name: 'email', label: t('cart.email'), type: 'email' },
    { name: 'address', label: t('cart.address'), type: 'text' },
  ]

  const close = () => {
    closeCart()
    setTimeout(() => setStage('cart'), 300)
  }

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const aside = asideRef.current
    aside?.querySelector<HTMLElement>('button, input')?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart()
        setTimeout(() => setStage('cart'), 300)
        return
      }
      if (e.key !== 'Tab' || !aside) return
      const focusables = aside.querySelectorAll<HTMLElement>('button, input, a[href]')
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, closeCart])

  const placeOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const customer = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      address: String(form.get('address') ?? ''),
    }
    setSending(true)
    setOrderError(false)
    try {
      const result = await submitOrder(customer, buildOrderItems(items, products), promo?.code)
      setOrderId(result.id)
      setPointsEarned(result.pointsEarned ?? 0)
      clear()
      setStage('done')
    } catch {
      setOrderError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
          />
          <m.aside
            ref={asideRef}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-coal z-50 flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog" aria-modal="true" aria-label={t('cart.dialogAria')}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display text-lg tracking-widest uppercase">
                {stage === 'checkout' ? t('cart.checkoutTitle') : stage === 'done' ? t('cart.thankYou') : t('cart.title')}
              </h2>
              <button onClick={close} className="text-mist hover:text-paper cursor-pointer" aria-label={t('cart.close')}>✕</button>
            </div>

            {stage === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {items.length === 0 && <p className="text-mist">{t('cart.empty')}</p>}
                  {items.map(item => {
                    const p = products.find(x => x.id === item.id)
                    if (!p) return null
                    return (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4">
                        <img src={p.images[0]} alt={p.name} className="w-20 h-24 object-cover" loading="lazy" />
                        <div className="flex-1">
                          <p className="text-sm">{p.name}</p>
                          <p className="text-xs text-mist mt-1">{t('cart.sizeLine', { size: item.size, price: formatMoney(p.price, lang) })}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <button onClick={() => setQty(item.id, item.size, item.qty - 1)} className="w-6 h-6 border border-white/20 cursor-pointer" aria-label={t('cart.decrease')}>−</button>
                            <span>{item.qty}</span>
                            <button onClick={() => setQty(item.id, item.size, item.qty + 1)} className="w-6 h-6 border border-white/20 cursor-pointer" aria-label={t('cart.increase')}>+</button>
                            <button onClick={() => removeItem(item.id, item.size)} className="ml-auto text-xs text-mist hover:text-paper cursor-pointer uppercase">{t('cart.remove')}</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {items.length > 0 && (
                  <div className="p-6 border-t border-white/10 space-y-4">
                    <div className="flex gap-2">
                      <input
                        value={promoInput}
                        onChange={e => { setPromoInput(e.target.value); setPromoError(false) }}
                        placeholder={t('cart.promoPlaceholder')}
                        aria-label={t('cart.promoPlaceholder')}
                        className="flex-1 bg-transparent border border-white/20 px-3 py-2 text-sm uppercase focus:border-paper outline-none placeholder:normal-case placeholder:text-mist/60"
                      />
                      <button
                        type="button"
                        onClick={() => void applyPromo()}
                        className="border border-white/20 px-4 text-[11px] uppercase tracking-widest hover:border-paper transition-colors cursor-pointer"
                      >
                        {t('cart.apply')}
                      </button>
                    </div>
                    {promoError && <p className="text-xs text-red-400 uppercase tracking-widest">{t('cart.promoInvalid')}</p>}
                    {promo && (
                      <>
                        <div className="flex justify-between text-xs uppercase tracking-widest text-mist">
                          <span>{t('cart.subtotal')}</span><span>{formatMoney(subtotal, lang)}</span>
                        </div>
                        <div className="flex justify-between text-xs uppercase tracking-widest text-mist">
                          <span>{t('cart.discount')} ({promo.code})</span><span>−{formatMoney(discount, lang)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm uppercase tracking-widest">
                      <span>{t('cart.total')}</span><span>{formatMoney(total, lang)}</span>
                    </div>
                    <button onClick={() => setStage('checkout')} className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer">
                      {t('cart.checkout')}
                    </button>
                  </div>
                )}
              </>
            )}

            {stage === 'checkout' && (
              <form onSubmit={placeOrder} className="flex-1 p-6 space-y-4 overflow-y-auto">
                {FIELDS.map(f => (
                  <label key={f.name} className="block text-xs uppercase tracking-widest text-mist">
                    {f.label}
                    <input
                      name={f.name} type={f.type} required
                      className="mt-2 w-full bg-transparent border border-white/20 p-3 text-paper text-sm focus:border-paper outline-none"
                    />
                  </label>
                ))}
                <div className="flex justify-between text-sm uppercase tracking-widest pt-4">
                  <span>{t('cart.total')}</span><span>{formatMoney(total, lang)}</span>
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sending ? t('cart.placing') : t('cart.placeOrder')}
                </button>
                {orderError && (
                  <p className="text-xs text-red-400 uppercase tracking-widest">{t('cart.orderError')}</p>
                )}
                <p className="text-xs text-mist">{t('cart.demoNote')}</p>
              </form>
            )}

            {stage === 'done' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="font-display text-2xl tracking-widest uppercase">{t('cart.orderPlaced')}</p>
                {orderId && <p className="text-sm tracking-widest text-paper/80">№ {orderId}</p>}
                {pointsEarned > 0 && (
                  <p className="text-sm text-paper">{t('account.pointsEarned', { count: pointsEarned })}</p>
                )}
                {orderId && (
                  <a
                    href={`https://t.me/${TELEGRAM_BOT}?start=${orderId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-white/20 px-6 py-3 uppercase tracking-widest text-xs hover:border-paper transition-colors"
                  >
                    {t('cart.telegramStatus')}
                  </a>
                )}
                <p className="text-sm text-mist">{t('cart.demoNoteDone')}</p>
                <button onClick={close} className="mt-4 border border-white/20 px-8 py-3 uppercase tracking-widest text-sm hover:border-paper transition-colors cursor-pointer">
                  {t('cart.continue')}
                </button>
              </div>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  )
}
