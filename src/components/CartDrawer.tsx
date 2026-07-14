import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { cartTotal, formatPrice } from '../utils/catalog'
import products from '../data/products.json'

type Stage = 'cart' | 'checkout' | 'done'

const FIELDS = [
  { name: 'name', label: 'Full name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Address', type: 'text' },
]

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, removeItem, clear } = useCart()
  const [stage, setStage] = useState<Stage>('cart')
  const total = cartTotal(items, products)
  const asideRef = useRef<HTMLElement>(null)

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

  const submitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clear()
    setStage('done')
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
            role="dialog" aria-modal="true" aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display text-lg tracking-widest uppercase">
                {stage === 'checkout' ? 'Checkout' : stage === 'done' ? 'Thank you' : 'Cart'}
              </h2>
              <button onClick={close} className="text-mist hover:text-paper cursor-pointer" aria-label="Close cart">✕</button>
            </div>

            {stage === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {items.length === 0 && <p className="text-mist">Your cart is empty.</p>}
                  {items.map(item => {
                    const p = products.find(x => x.id === item.id)
                    if (!p) return null
                    return (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4">
                        <img src={p.images[0]} alt={p.name} className="w-20 h-24 object-cover" loading="lazy" />
                        <div className="flex-1">
                          <p className="text-sm">{p.name}</p>
                          <p className="text-xs text-mist mt-1">Size {item.size} · {formatPrice(p.price)}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <button onClick={() => setQty(item.id, item.size, item.qty - 1)} className="w-6 h-6 border border-white/20 cursor-pointer" aria-label="Decrease quantity">−</button>
                            <span>{item.qty}</span>
                            <button onClick={() => setQty(item.id, item.size, item.qty + 1)} className="w-6 h-6 border border-white/20 cursor-pointer" aria-label="Increase quantity">+</button>
                            <button onClick={() => removeItem(item.id, item.size)} className="ml-auto text-xs text-mist hover:text-paper cursor-pointer uppercase">Remove</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {items.length > 0 && (
                  <div className="p-6 border-t border-white/10 space-y-4">
                    <div className="flex justify-between text-sm uppercase tracking-widest">
                      <span>Total</span><span>{formatPrice(total)}</span>
                    </div>
                    <button onClick={() => setStage('checkout')} className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer">
                      Checkout
                    </button>
                  </div>
                )}
              </>
            )}

            {stage === 'checkout' && (
              <form onSubmit={submitOrder} className="flex-1 p-6 space-y-4 overflow-y-auto">
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
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
                <button type="submit" className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer">
                  Place order
                </button>
                <p className="text-xs text-mist">Demo checkout — no payment, no data stored.</p>
              </form>
            )}

            {stage === 'done' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="font-display text-2xl tracking-widest uppercase">Order placed</p>
                <p className="text-sm text-mist">This is a portfolio demo — nothing was charged.</p>
                <button onClick={close} className="mt-4 border border-white/20 px-8 py-3 uppercase tracking-widest text-sm hover:border-paper transition-colors cursor-pointer">
                  Continue
                </button>
              </div>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  )
}
