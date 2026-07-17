import { describe, it, expect } from 'vitest'
import { cosineSimilarity, rankBySimilarity, productText } from './semantic'
import type { Product } from '../types'

describe('cosineSimilarity', () => {
  it('is 1 for identical normalized vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBe(1)
  })
  it('is 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0)
  })
  it('is negative for opposite vectors', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBe(-1)
  })
})

describe('rankBySimilarity', () => {
  it('orders items by similarity to the query, best first', () => {
    const items = ['far', 'near', 'mid']
    const embeddings = [
      [0, 1], // orthogonal to query
      [1, 0], // identical to query
      [0.7071, 0.7071], // 45 degrees
    ]
    const ranked = rankBySimilarity(items, embeddings, [1, 0])
    expect(ranked.map(r => r.item)).toEqual(['near', 'mid', 'far'])
    expect(ranked[0].score).toBeCloseTo(1)
    expect(ranked[2].score).toBeCloseTo(0)
  })
})

describe('productText', () => {
  it('combines name, category and description', () => {
    const p = { name: 'Wool Coat', category: 'outerwear', description: 'Warm.' } as Product
    expect(productText(p)).toBe('Wool Coat. outerwear. Warm.')
  })
  it('appends search tags when present', () => {
    const p = {
      name: 'Beanie',
      category: 'accessories',
      description: 'Knit.',
      tags: ['hat', 'warm'],
    } as Product
    expect(productText(p)).toBe('Beanie. accessories. Knit. Keywords: hat, warm.')
  })
})
