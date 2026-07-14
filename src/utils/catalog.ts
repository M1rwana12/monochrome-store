import type { CartItem, Product } from '../types'

export interface CatalogFilters {
  category?: string | null
  size?: string | null
  maxPrice?: number | null
}

export function filterProducts(
  products: Product[],
  { category, size, maxPrice }: CatalogFilters = {},
) {
  return products.filter(p => {
    if (category && category !== 'all' && p.category !== category) return false
    if (size && size !== 'all' && !p.sizes.includes(size)) return false
    if (maxPrice && p.price > maxPrice) return false
    return true
  })
}

export function sortProducts(products: Product[], sort?: string) {
  const arr = [...products]
  if (sort === 'price-asc') return arr.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return arr.sort((a, b) => b.price - a.price)
  if (sort === 'new') return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew))
  return arr
}

export function formatPrice(n: number) {
  return `$${n}`
}

export function cartTotal(cartItems: CartItem[], products: Product[]) {
  return cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id)
    return product ? sum + product.price * item.qty : sum
  }, 0)
}
