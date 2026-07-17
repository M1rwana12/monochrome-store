import { describe, it, expect } from 'vitest'
import { buildOrderItems } from './orders'
import type { Product } from '../types'

const P = [
  { id: 'p01', name: 'Coat', price: 290 },
  { id: 'p05', name: 'Tee', price: 45 },
] as Product[]

describe('buildOrderItems', () => {
  it('joins cart items with product name and price', () => {
    const items = buildOrderItems(
      [
        { id: 'p01', size: 'M', qty: 2 },
        { id: 'p05', size: 'L', qty: 1 },
      ],
      P,
    )
    expect(items).toEqual([
      { id: 'p01', name: 'Coat', size: 'M', qty: 2, price: 290 },
      { id: 'p05', name: 'Tee', size: 'L', qty: 1, price: 45 },
    ])
  })

  it('drops unknown product ids', () => {
    expect(buildOrderItems([{ id: 'zzz', size: 'S', qty: 1 }], P)).toEqual([])
  })
})
