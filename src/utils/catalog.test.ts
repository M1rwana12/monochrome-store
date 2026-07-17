import { describe, it, expect } from 'vitest'
import { filterProducts, sortProducts, formatPrice, cartTotal } from './catalog'
import type { Product } from '../types'

const P = [
  { id: 'a', price: 100, category: 'tees', sizes: ['S', 'M'], isNew: false },
  { id: 'b', price: 50, category: 'pants', sizes: ['L'], isNew: true },
  { id: 'c', price: 300, category: 'tees', sizes: ['M'], isNew: true },
] as Product[]

describe('filterProducts', () => {
  it('filters by category', () => {
    expect(filterProducts(P, { category: 'tees' }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('filters by size', () => {
    expect(filterProducts(P, { size: 'M' }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('filters by maxPrice', () => {
    expect(filterProducts(P, { maxPrice: 100 }).map(p => p.id)).toEqual(['a', 'b'])
  })
  it('"all" and empty values are ignored', () => {
    expect(filterProducts(P, { category: 'all', size: 'all', maxPrice: null })).toHaveLength(3)
  })
})

describe('sortProducts', () => {
  it('price-asc', () => {
    expect(sortProducts(P, 'price-asc').map(p => p.id)).toEqual(['b', 'a', 'c'])
  })
  it('price-desc', () => {
    expect(sortProducts(P, 'price-desc').map(p => p.id)).toEqual(['c', 'a', 'b'])
  })
  it('new puts isNew first, keeps original order otherwise', () => {
    expect(sortProducts(P, 'new').map(p => p.id)).toEqual(['b', 'c', 'a'])
  })
  it('does not mutate input', () => {
    const copy = [...P]
    sortProducts(P, 'price-asc')
    expect(P).toEqual(copy)
  })
})

describe('formatPrice', () => {
  it('formats USD', () => expect(formatPrice(290)).toBe('$290'))
})

describe('cartTotal', () => {
  it('sums qty * price by product id', () => {
    const cart = [
      { id: 'a', size: 'S', qty: 2 },
      { id: 'b', size: 'L', qty: 1 },
    ]
    expect(cartTotal(cart, P)).toBe(250)
  })
  it('ignores unknown ids', () => {
    expect(cartTotal([{ id: 'zzz', size: 'S', qty: 5 }], P)).toBe(0)
  })
})
