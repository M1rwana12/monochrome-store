import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { FavoritesProvider, useFavorites } from './FavoritesContext'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <FavoritesProvider>{children}</FavoritesProvider>
  </AuthProvider>
)

beforeEach(() => localStorage.clear())

describe('favorites', () => {
  it('toggle adds and removes an id', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    expect(result.current.has('p01')).toBe(false)
    act(() => result.current.toggle('p01'))
    expect(result.current.has('p01')).toBe(true)
    expect(result.current.count).toBe(1)
    act(() => result.current.toggle('p01'))
    expect(result.current.has('p01')).toBe(false)
    expect(result.current.count).toBe(0)
  })

  it('keeps insertion order of ids', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    act(() => result.current.toggle('p03'))
    act(() => result.current.toggle('p01'))
    expect(result.current.ids).toEqual(['p03', 'p01'])
  })

  it('persists to localStorage and restores', () => {
    const first = renderHook(() => useFavorites(), { wrapper })
    act(() => first.result.current.toggle('p05'))
    first.unmount()
    const second = renderHook(() => useFavorites(), { wrapper })
    expect(second.result.current.has('p05')).toBe(true)
  })
})
