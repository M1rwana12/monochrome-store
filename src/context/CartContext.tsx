import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { track } from '@vercel/analytics'
import type { CartItem } from '../types'

interface CartContextValue {
  items: CartItem[]
  addItem: (id: string, size: string) => void
  removeItem: (id: string, size: string) => void
  setQty: (id: string, size: string, qty: number) => void
  clear: () => void
  count: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'monochrome-cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (id: string, size: string) => {
    setItems(prev => {
      const found = prev.find(i => i.id === id && i.size === size)
      if (found) {
        return prev.map(i => (i === found ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { id, size, qty: 1 }]
    })
    setIsOpen(true)
    track('add_to_cart', { product: id, size })
  }

  const removeItem = (id: string, size: string) =>
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)))

  const setQty = (id: string, size: string, qty: number) => {
    if (qty < 1) return removeItem(id, size)
    setItems(prev => prev.map(i => (i.id === id && i.size === size ? { ...i, qty } : i)))
  }

  const clear = () => setItems([])
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const value: CartContextValue = {
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
