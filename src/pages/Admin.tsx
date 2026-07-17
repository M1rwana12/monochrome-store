import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { fetchOrders, setOrderStatus, type Order } from '../utils/orders'
import { formatPrice } from '../utils/catalog'
import useDocumentTitle from '../hooks/useDocumentTitle'

const TOKEN_KEY = 'mc-admin-token'

export default function Admin() {
  useDocumentTitle('Admin')
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))
  const [input, setInput] = useState('')
  const [authError, setAuthError] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const load = useCallback(async (t: string) => {
    try {
      const data = await fetchOrders(t)
      setOrders(data)
      setLoadError(false)
      return true
    } catch (err) {
      if ((err as { unauthorized?: boolean }).unauthorized) {
        sessionStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setAuthError(true)
      } else {
        setLoadError(true)
      }
      return false
    }
  }, [])

  // Data fetching on mount/token change; all setState happens after await.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (token) void load(token)
  }, [token, load])

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(false)
    const t = input.trim()
    if (!t) return
    if (await load(t)) {
      sessionStorage.setItem(TOKEN_KEY, t)
      setToken(t)
    }
  }

  const toggle = async (order: Order) => {
    if (!token) return
    const next = order.status === 'new' ? 'done' : 'new'
    try {
      await setOrderStatus(token, order.id, next)
      setOrders(prev => prev?.map(o => (o.id === order.id ? { ...o, status: next } : o)) ?? null)
    } catch {
      setLoadError(true)
    }
  }

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setOrders(null)
    setInput('')
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-4 pt-40 pb-24">
        <h1 className="font-display text-2xl uppercase tracking-widest text-center">Admin</h1>
        <form onSubmit={login} className="mt-8 space-y-4">
          <label className="block text-xs uppercase tracking-widest text-mist">
            Access token
            <input
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="mt-2 w-full bg-transparent border border-white/20 p-3 text-paper text-sm focus:border-paper outline-none"
              autoFocus
            />
          </label>
          {authError && (
            <p className="text-xs text-red-400 uppercase tracking-widest">Wrong token</p>
          )}
          <button className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer">
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-28 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase tracking-widest">Orders</h1>
        <div className="flex gap-3">
          <button onClick={() => token && load(token)} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest hover:border-paper transition-colors cursor-pointer">
            Refresh
          </button>
          <button onClick={logout} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-mist hover:border-paper hover:text-paper transition-colors cursor-pointer">
            Logout
          </button>
        </div>
      </div>

      {loadError && (
        <p className="mt-6 text-xs text-red-400 uppercase tracking-widest">Request failed — try refresh.</p>
      )}

      {orders && orders.length === 0 && (
        <p className="mt-16 text-center text-mist">No orders yet.</p>
      )}

      <div className="mt-8 space-y-4">
        {orders?.map(order => (
          <div key={order.id} className="border border-white/10 bg-coal p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-display tracking-widest">{order.id}</span>
              <span className="text-xs text-mist">{new Date(order.createdAt).toLocaleString()}</span>
              <span
                className={`text-[10px] uppercase tracking-widest px-2 py-1 ${
                  order.status === 'new' ? 'bg-paper text-ink' : 'border border-white/20 text-mist'
                }`}
              >
                {order.status}
              </span>
              <span className="ml-auto text-sm">{formatPrice(order.total)}</span>
              <button
                onClick={() => toggle(order)}
                className="border border-white/20 px-3 py-1.5 text-[11px] uppercase tracking-widest hover:border-paper transition-colors cursor-pointer"
              >
                {order.status === 'new' ? 'Mark done' : 'Reopen'}
              </button>
            </div>
            <div className="mt-3 text-sm text-paper/80">
              {order.items.map(i => (
                <div key={`${i.id}-${i.size}`}>
                  {i.name} ({i.size}) ×{i.qty} — {formatPrice(i.price * i.qty)}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-mist">
              {order.customer.name} · {order.customer.email} · {order.customer.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
