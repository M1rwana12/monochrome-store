import { describe, it, expect } from 'vitest'
import products from './products.json'

const CATEGORIES = ['outerwear', 'hoodies', 'tees', 'pants', 'accessories']

describe('products.json', () => {
  it('has at least 12 products', () => {
    expect(products.length).toBeGreaterThanOrEqual(12)
  })
  it('every product has a valid shape', () => {
    for (const p of products) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.name).toBe('string')
      expect(CATEGORIES).toContain(p.category)
      expect(p.price).toBeGreaterThan(0)
      expect(p.sizes.length).toBeGreaterThan(0)
      expect(p.images.length).toBeGreaterThan(0)
      expect(typeof p.description.uk).toBe('string')
      expect(typeof p.description.en).toBe('string')
      expect(p.description.uk.length).toBeGreaterThan(0)
      expect(p.description.en.length).toBeGreaterThan(0)
      expect(typeof p.isNew).toBe('boolean')
    }
  })
  it('ids are unique', () => {
    const ids = products.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
