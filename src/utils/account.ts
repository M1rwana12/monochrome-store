import type { Order } from './orders'
import type { LevelName } from './bonus'

export interface BonusTransaction {
  id: string
  type: 'register' | 'order'
  orderId?: string
  points: number
  createdAt: string
}

export interface Me {
  email: string
  name: string
  points: number
  totalSpentUsd: number
  level: LevelName
  transactions?: BonusTransaction[]
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw Object.assign(new Error(body.error ?? `HTTP ${res.status}`), { status: res.status })
  }
  return res.json() as Promise<T>
}

export async function apiRegister(email: string, password: string, name: string) {
  return json<Me>(
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    }),
  )
}

export async function apiLogin(email: string, password: string) {
  return json<Me>(
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  )
}

export async function apiLogout() {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function apiMe(): Promise<Me | null> {
  const res = await fetch('/api/me')
  if (res.status === 401) return null
  return json<Me>(res)
}

export async function apiMyOrders() {
  return json<Order[]>(await fetch('/api/me/orders'))
}

export async function apiGetFavorites() {
  return json<string[]>(await fetch('/api/me/favorites'))
}

export async function apiPutFavorites(ids: string[]) {
  await fetch('/api/me/favorites', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ids),
  })
}
