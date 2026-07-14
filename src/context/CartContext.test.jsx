import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

beforeEach(() => localStorage.clear())

describe('cart', () => {
  it('adds items and merges same id+size', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem('p01', 'M'))
    act(() => result.current.addItem('p01', 'M'))
    act(() => result.current.addItem('p01', 'L'))
    expect(result.current.items).toEqual([
      { id: 'p01', size: 'M', qty: 2 },
      { id: 'p01', size: 'L', qty: 1 },
    ])
    expect(result.current.count).toBe(3)
  })

  it('addItem opens the drawer', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.isOpen).toBe(false)
    act(() => result.current.addItem('p01', 'M'))
    expect(result.current.isOpen).toBe(true)
  })

  it('setQty updates and removes at qty < 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem('p01', 'M'))
    act(() => result.current.setQty('p01', 'M', 5))
    expect(result.current.items[0].qty).toBe(5)
    act(() => result.current.setQty('p01', 'M', 0))
    expect(result.current.items).toHaveLength(0)
  })

  it('persists to localStorage and restores', () => {
    const first = renderHook(() => useCart(), { wrapper })
    act(() => first.result.current.addItem('p02', 'S'))
    first.unmount()
    const second = renderHook(() => useCart(), { wrapper })
    expect(second.result.current.items).toEqual([{ id: 'p02', size: 'S', qty: 1 }])
  })

  it('clear empties the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem('p01', 'M'))
    act(() => result.current.clear())
    expect(result.current.items).toHaveLength(0)
  })
})
