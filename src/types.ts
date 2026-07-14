export interface Product {
  id: string
  name: string
  category: string
  price: number
  sizes: string[]
  images: string[]
  description: string
  isNew: boolean
}

export interface CartItem {
  id: string
  size: string
  qty: number
}
