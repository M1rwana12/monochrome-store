import type { Order } from './orders'

export interface Kpis {
  todayOrders: number
  todayRevenueUsd: number
  weekOrders: number
  weekRevenueUsd: number
  avgOrderUsd: number
  activeOrders: number
}

const DAY_MS = 24 * 60 * 60 * 1000

const dayKey = (iso: string) => iso.slice(0, 10)

export function computeKpis(orders: Order[], now = new Date()): Kpis {
  const today = dayKey(now.toISOString())
  const weekAgo = now.getTime() - 7 * DAY_MS
  const paid = orders.filter(o => o.status !== 'cancelled')
  const todays = paid.filter(o => dayKey(o.createdAt) === today)
  const week = paid.filter(o => new Date(o.createdAt).getTime() >= weekAgo)
  return {
    todayOrders: todays.length,
    todayRevenueUsd: todays.reduce((s, o) => s + o.total, 0),
    weekOrders: week.length,
    weekRevenueUsd: week.reduce((s, o) => s + o.total, 0),
    avgOrderUsd: paid.length ? Math.round(paid.reduce((s, o) => s + o.total, 0) / paid.length) : 0,
    activeOrders: orders.filter(o => o.status === 'new' || o.status === 'confirmed' || o.status === 'shipped').length,
  }
}

export interface DayPoint {
  day: string // YYYY-MM-DD
  revenueUsd: number
  orders: number
}

export function dailySeries(orders: Order[], days = 30, now = new Date()): DayPoint[] {
  const series: DayPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    series.push({ day: dayKey(new Date(now.getTime() - i * DAY_MS).toISOString()), revenueUsd: 0, orders: 0 })
  }
  const index = new Map(series.map(p => [p.day, p]))
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    const point = index.get(dayKey(order.createdAt))
    if (point) {
      point.revenueUsd += order.total
      point.orders += 1
    }
  }
  return series
}

export interface TopProduct {
  id: string
  name: string
  qty: number
  revenueUsd: number
}

export function topProducts(orders: Order[], limit = 5): TopProduct[] {
  const acc = new Map<string, TopProduct>()
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    for (const item of order.items) {
      const entry = acc.get(item.id) ?? { id: item.id, name: item.name, qty: 0, revenueUsd: 0 }
      entry.qty += item.qty
      entry.revenueUsd += item.price * item.qty
      acc.set(item.id, entry)
    }
  }
  return [...acc.values()].sort((a, b) => b.qty - a.qty).slice(0, limit)
}
