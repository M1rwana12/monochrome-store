import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  fetchCustomers,
  fetchOrders,
  ORDER_STATUSES,
  setOrderStatus,
  type AdminCustomer,
  type Order,
  type OrderStatus,
} from '../utils/orders'
import { computeKpis, dailySeries, topProducts } from '../utils/adminStats'
import { formatPrice } from '../utils/catalog'
import Select from '../components/Select'
import useDocumentTitle from '../hooks/useDocumentTitle'

const TOKEN_KEY = 'mc-admin-token'

type Tab = 'dashboard' | 'orders' | 'customers'

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'bg-paper text-ink',
  confirmed: 'border border-paper/60',
  shipped: 'border border-paper/60',
  done: 'border border-white/20 text-mist',
  cancelled: 'border border-red-400/50 text-red-400',
}

export default function Admin() {
  useDocumentTitle('Admin')
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))
  const [input, setInput] = useState('')
  const [authError, setAuthError] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')

  const load = useCallback(async (t: string) => {
    try {
      const [orderList, customerList] = await Promise.all([fetchOrders(t), fetchCustomers(t)])
      setOrders(orderList)
      setCustomers(customerList)
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

  useEffect(() => {
    if (!token) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; setState happens after await
    void load(token)
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

  const changeStatus = async (order: Order, status: OrderStatus) => {
    if (!token || order.status === status) return
    try {
      await setOrderStatus(token, order.id, status)
      setOrders(prev => prev?.map(o => (o.id === order.id ? { ...o, status } : o)) ?? null)
    } catch {
      setLoadError(true)
    }
  }

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setOrders(null)
    setCustomers(null)
    setInput('')
  }

  const kpis = useMemo(() => (orders ? computeKpis(orders) : null), [orders])
  const series = useMemo(() => (orders ? dailySeries(orders) : []), [orders])
  const top = useMemo(() => (orders ? topProducts(orders) : []), [orders])
  const maxRevenue = Math.max(1, ...series.map(p => p.revenueUsd))

  const visibleOrders = useMemo(() => {
    if (!orders) return []
    const q = query.trim().toLowerCase()
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q)
      )
    })
  }, [orders, query, statusFilter])

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
          {authError && <p className="text-xs text-red-400 uppercase tracking-widest">Wrong token</p>}
          <button className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer">
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl uppercase tracking-widest">Admin</h1>
        <div className="flex gap-3">
          <button onClick={() => token && load(token)} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest hover:border-paper transition-colors cursor-pointer">
            Refresh
          </button>
          <button onClick={logout} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-mist hover:border-paper hover:text-paper transition-colors cursor-pointer">
            Logout
          </button>
        </div>
      </div>

      <div className="mt-6 flex border border-white/20 text-xs uppercase tracking-widest max-w-md">
        {(['dashboard', 'orders', 'customers'] as Tab[]).map(name => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`flex-1 py-3 cursor-pointer transition-colors ${tab === name ? 'bg-paper text-ink' : 'hover:text-mist'}`}
          >
            {name}
          </button>
        ))}
      </div>

      {loadError && <p className="mt-6 text-xs text-red-400 uppercase tracking-widest">Request failed — try refresh.</p>}

      {tab === 'dashboard' && kpis && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Today', value: `${kpis.todayOrders} orders · ${formatPrice(kpis.todayRevenueUsd)}` },
              { label: 'Last 7 days', value: `${kpis.weekOrders} orders · ${formatPrice(kpis.weekRevenueUsd)}` },
              { label: 'Avg order', value: formatPrice(kpis.avgOrderUsd) },
              { label: 'Active orders', value: String(kpis.activeOrders) },
            ].map(card => (
              <div key={card.label} className="border border-white/10 bg-coal p-5">
                <p className="text-[10px] uppercase tracking-widest text-mist">{card.label}</p>
                <p className="mt-2 font-display text-lg">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="border border-white/10 bg-coal p-5">
            <p className="text-[10px] uppercase tracking-widest text-mist">Revenue — last 30 days</p>
            <div className="mt-4 flex items-end gap-[3px] h-32" role="img" aria-label="Revenue chart, last 30 days">
              {series.map(point => (
                <div
                  key={point.day}
                  title={`${point.day}: ${formatPrice(point.revenueUsd)} (${point.orders})`}
                  className={`flex-1 ${point.revenueUsd > 0 ? 'bg-paper' : 'bg-white/10'}`}
                  style={{ height: `${Math.max(3, (point.revenueUsd / maxRevenue) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-mist">
              <span>{series[0]?.day}</span>
              <span>{series[series.length - 1]?.day}</span>
            </div>
          </div>

          <div className="border border-white/10 bg-coal p-5">
            <p className="text-[10px] uppercase tracking-widest text-mist">Top products</p>
            <div className="mt-3 space-y-2">
              {top.length === 0 && <p className="text-sm text-mist">No sales yet.</p>}
              {top.map(product => (
                <div key={product.id} className="flex items-baseline justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="text-mist">×{product.qty} · {formatPrice(product.revenueUsd)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="mt-8">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search id / email / name"
              aria-label="Search orders"
              className="flex-1 min-w-52 bg-transparent border border-white/20 px-4 py-2 text-sm focus:border-paper outline-none placeholder:text-mist/60"
            />
            <Select
              label="Status filter"
              value={statusFilter}
              options={[{ value: 'all', label: 'All statuses' }, ...ORDER_STATUSES.map(s => ({ value: s, label: s }))]}
              onChange={v => setStatusFilter(v as 'all' | OrderStatus)}
              alignRight
            />
          </div>

          {orders && visibleOrders.length === 0 && <p className="mt-10 text-center text-mist">No matching orders.</p>}

          <div className="mt-6 space-y-4">
            {visibleOrders.map(order => (
              <div key={order.id} className="border border-white/10 bg-coal p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-display tracking-widest">{order.id}</span>
                  <span className="text-xs text-mist">{new Date(order.createdAt).toLocaleString()}</span>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="ml-auto text-sm">{formatPrice(order.total)}</span>
                  <Select
                    label="Set status"
                    value={order.status}
                    options={ORDER_STATUSES.map(s => ({ value: s, label: s }))}
                    onChange={v => void changeStatus(order, v as OrderStatus)}
                    alignRight
                  />
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
                {order.statusHistory && order.statusHistory.length > 1 && (
                  <div className="mt-2 text-[11px] text-mist/70">
                    {order.statusHistory.map(h => `${h.status} (${new Date(h.at).toLocaleString()})`).join(' → ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="mt-8 space-y-4">
          {customers && customers.length === 0 && <p className="text-center text-mist mt-10">No customers yet.</p>}
          {customers?.map(customer => (
            <div key={customer.email} className="border border-white/10 bg-coal p-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="min-w-48">
                <p className="text-sm">{customer.name}</p>
                <p className="text-xs text-mist">{customer.email}</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-white/20">
                {customer.level}
              </span>
              <span className="text-xs text-mist">{customer.ordersCount} orders</span>
              <span className="text-xs text-mist">{customer.points} pts</span>
              <span className="ml-auto text-sm">{formatPrice(customer.totalSpentUsd)}</span>
              <span className="text-[11px] text-mist/70">since {new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
