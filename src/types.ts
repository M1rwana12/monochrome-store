export interface LocalizedText {
  uk: string
  en: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  sizes: string[]
  images: string[]
  description: LocalizedText
  isNew: boolean
  tags?: string[]
  hoverVideo?: string
  lowStock?: number
}

export interface CartItem {
  id: string
  size: string
  qty: number
}
