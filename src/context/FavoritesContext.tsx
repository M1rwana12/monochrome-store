import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { apiGetFavorites, apiPutFavorites } from '../utils/account'

interface FavoritesContextValue {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
  count: number
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)
const STORAGE_KEY = 'monochrome-favorites'

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [ids, setIds] = useState<string[]>(loadFavorites)
  const syncedFor = useRef<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  // On login, merge the guest list with the account list once, then push the union
  useEffect(() => {
    if (!user) {
      syncedFor.current = null
      return
    }
    if (syncedFor.current === user.email) return
    syncedFor.current = user.email
    void (async () => {
      try {
        const server = await apiGetFavorites()
        const merged = [...new Set([...server, ...loadFavorites()])]
        // eslint-disable-next-line react-hooks/set-state-in-effect -- runs after await, not synchronously
        setIds(merged)
        await apiPutFavorites(merged)
      } catch {
        // offline / server hiccup: keep the local list
      }
    })()
  }, [user])

  const toggle = (id: string) =>
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      if (user) void apiPutFavorites(next).catch(() => {})
      return next
    })

  const value: FavoritesContextValue = {
    ids,
    toggle,
    has: id => ids.includes(id),
    count: ids.length,
  }
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
