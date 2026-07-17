import type { Product } from '../types'

export type Embedding = number[]

type Embedder = (texts: string[]) => Promise<Embedding[]>

let embedderPromise: Promise<Embedder> | null = null

// Loads the model lazily (dynamic import keeps ~1MB of JS + the ~25MB model
// out of the main bundle until the user actually opens AI search).
async function createEmbedder(): Promise<Embedder> {
  const { pipeline } = await import('@huggingface/transformers')
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    dtype: 'q8',
  })
  return async texts => {
    const output = await extractor(texts, { pooling: 'mean', normalize: true })
    return output.tolist() as Embedding[]
  }
}

export function getEmbedder(): Promise<Embedder> {
  embedderPromise ??= createEmbedder()
  return embedderPromise
}

export function productText(p: Product) {
  const tags = p.tags?.length ? ` Keywords: ${p.tags.join(', ')}.` : ''
  return `${p.name}. ${p.category}. ${p.description}${tags}`
}

// Embeddings are L2-normalized, so cosine similarity reduces to a dot product
export function cosineSimilarity(a: Embedding, b: Embedding) {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

export interface Ranked<T> {
  item: T
  score: number
}

export function rankBySimilarity<T>(
  items: T[],
  itemEmbeddings: Embedding[],
  queryEmbedding: Embedding,
): Ranked<T>[] {
  return items
    .map((item, i) => ({ item, score: cosineSimilarity(itemEmbeddings[i], queryEmbedding) }))
    .sort((a, b) => b.score - a.score)
}
