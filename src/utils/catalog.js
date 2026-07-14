export function filterProducts(products, { category, size, maxPrice } = {}) {
  return products.filter(p => {
    if (category && category !== 'all' && p.category !== category) return false
    if (size && size !== 'all' && !p.sizes.includes(size)) return false
    if (maxPrice && p.price > maxPrice) return false
    return true
  })
}

export function sortProducts(products, sort) {
  const arr = [...products]
  if (sort === 'price-asc') return arr.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return arr.sort((a, b) => b.price - a.price)
  if (sort === 'new') return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew))
  return arr
}

export function formatPrice(n) {
  return `$${n}`
}

export function cartTotal(cartItems, products) {
  return cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id)
    return product ? sum + product.price * item.qty : sum
  }, 0)
}
