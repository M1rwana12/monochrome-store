export interface Review {
  id: string
  productId: string
  name: string
  rating: number
  text: string
  createdAt: string
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const res = await fetch(`/api/products/${productId}/reviews`)
  if (!res.ok) throw new Error(`Reviews failed: ${res.status}`)
  return res.json() as Promise<Review[]>
}

export async function postReview(productId: string, rating: number, text: string): Promise<Review> {
  const res = await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, text }),
  })
  if (!res.ok) throw Object.assign(new Error(`Review failed: ${res.status}`), { status: res.status })
  return res.json() as Promise<Review>
}

export function averageRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
}
