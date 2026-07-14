import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'monochrome-cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (id, size) => {
    setItems(prev => {
      const found = prev.find(i => i.id === id && i.size === size)
      if (found) {
        return prev.map(i => (i === found ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { id, size, qty: 1 }]
    })
    setIsOpen(true)
  }

  const removeItem = (id, size) =>
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)))

  const setQty = (id, size, qty) => {
    if (qty < 1) return removeItem(id, size)
    setItems(prev => prev.map(i => (i.id === id && i.size === size ? { ...i, qty } : i)))
  }

  const clear = () => setItems([])
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const value = {
    items, addItem, removeItem, setQty, clear, count,
    isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
