import type { CartItem, Product } from '../types'

export interface OrderCustomer {
  name: string
  email: string
  address: string
}

export interface OrderItem {
  id: string
  name: string
  size: string
  qty: number
  price: number
}

export const ORDER_STATUSES = ['new', 'confirmed', 'shipped', 'done', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  statusHistory?: { status: OrderStatus; at: string }[]
  customer: OrderCustomer
  items: OrderItem[]
  total: number
}

export interface AdminCustomer {
  email: string
  name: string
  points: number
  totalSpentUsd: number
  ordersCount: number
  level: string
  createdAt: string
}

export function buildOrderItems(cartItems: CartItem[], products: Product[]): OrderItem[] {
  return cartItems.flatMap(item => {
    const product = products.find(p => p.id === item.id)
    return product
      ? [{ id: product.id, name: product.name, size: item.size, qty: item.qty, price: product.price }]
      : []
  })
}

export async function submitOrder(customer: OrderCustomer, items: OrderItem[]) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer, items }),
  })
  if (!res.ok) throw new Error(`Order failed: ${res.status}`)
  return (await res.json()) as { id: string; pointsEarned?: number }
}

export async function fetchOrders(token: string) {
  const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
  if (res.status === 401) throw Object.assign(new Error('unauthorized'), { unauthorized: true })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return (await res.json()) as Order[]
}

export async function setOrderStatus(token: string, id: string, status: OrderStatus) {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`Update failed: ${res.status}`)
}

export async function fetchCustomers(token: string) {
  const res = await fetch('/api/admin/customers', { headers: { Authorization: `Bearer ${token}` } })
  if (res.status === 401) throw Object.assign(new Error('unauthorized'), { unauthorized: true })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return (await res.json()) as AdminCustomer[]
}
