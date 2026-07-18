import { describe, it, expect } from 'vitest'
import { computeKpis, dailySeries, topProducts } from './adminStats'
import type { Order } from './orders'

const NOW = new Date('2026-07-18T12:00:00.000Z')

const order = (over: Partial<Order>): Order => ({
  id: 'MC-1',
  createdAt: '2026-07-18T09:00:00.000Z',
  status: 'new',
  customer: { name: 'A', email: 'a@a.com', address: 'Kyiv' },
  items: [{ id: 'p01', name: 'Coat', size: 'M', qty: 1, price: 290 }],
  total: 290,
  ...over,
})

describe('computeKpis', () => {
  it('counts today and 7-day windows, skips cancelled', () => {
    const orders = [
      order({ id: 'a', total: 100 }),
      order({ id: 'b', createdAt: '2026-07-15T10:00:00.000Z', total: 50 }),
      order({ id: 'c', createdAt: '2026-06-01T10:00:00.000Z', total: 999 }),
      order({ id: 'd', total: 500, status: 'cancelled' }),
    ]
    const k = computeKpis(orders, NOW)
    expect(k.todayOrders).toBe(1)
    expect(k.todayRevenueUsd).toBe(100)
    expect(k.weekOrders).toBe(2)
    expect(k.weekRevenueUsd).toBe(150)
    expect(k.avgOrderUsd).toBe(Math.round((100 + 50 + 999) / 3))
    expect(k.activeOrders).toBe(3)
  })
})

describe('dailySeries', () => {
  it('buckets revenue into the right day of a fixed-length series', () => {
    const series = dailySeries([order({ total: 70 })], 7, NOW)
    expect(series).toHaveLength(7)
    expect(series[6].day).toBe('2026-07-18')
    expect(series[6].revenueUsd).toBe(70)
    expect(series[0].revenueUsd).toBe(0)
  })
})

describe('topProducts', () => {
  it('aggregates by product and sorts by quantity', () => {
    const orders = [
      order({ items: [{ id: 'p01', name: 'Coat', size: 'M', qty: 1, price: 290 }] }),
      order({
        id: 'MC-2',
        items: [
          { id: 'p10', name: 'Beanie', size: 'ONE', qty: 3, price: 35 },
          { id: 'p01', name: 'Coat', size: 'L', qty: 1, price: 290 },
        ],
      }),
    ]
    const top = topProducts(orders)
    expect(top[0]).toEqual({ id: 'p10', name: 'Beanie', qty: 3, revenueUsd: 105 })
    expect(top[1].qty).toBe(2)
  })
})
