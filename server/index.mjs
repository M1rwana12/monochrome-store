import express from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const PORT = process.env.PORT || 8080
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ''
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || ''

// Firestore on Cloud Run (K_SERVICE is set there); in-memory store for local runs
const useFirestore = Boolean(process.env.K_SERVICE || process.env.USE_FIRESTORE)
let ordersStore
if (useFirestore) {
  const { Firestore } = await import('@google-cloud/firestore')
  const col = new Firestore().collection('orders')
  ordersStore = {
    async add(order) {
      await col.doc(order.id).set(order)
    },
    async list() {
      const snap = await col.orderBy('createdAt', 'desc').limit(100).get()
      return snap.docs.map(d => d.data())
    },
    async setStatus(id, status) {
      await col.doc(id).update({ status })
    },
  }
  console.log('orders store: Firestore')
} else {
  const mem = []
  ordersStore = {
    async add(order) {
      mem.unshift(order)
    },
    async list() {
      return mem.slice(0, 100)
    },
    async setStatus(id, status) {
      const order = mem.find(o => o.id === id)
      if (!order) throw Object.assign(new Error('not found'), { code: 404 })
      order.status = status
    },
  }
  console.log('orders store: in-memory (local mode)')
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Demo-store trust model: prices come from the client and are only sanity-checked.
// A real shop would price items server-side.
function parseOrder(body) {
  if (!body || typeof body !== 'object') return null
  const customer = {
    name: str(body.customer?.name, 200),
    email: str(body.customer?.email, 200),
    address: str(body.customer?.address, 500),
  }
  if (!customer.name || !customer.email || !customer.address) return null
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) return null
  const items = body.items.map(i => ({
    id: str(i?.id, 20),
    name: str(i?.name, 100),
    size: str(i?.size, 10),
    qty: Math.min(Math.max(Number.parseInt(i?.qty, 10) || 0, 1), 99),
    price: Math.min(Math.max(Number(i?.price) || 0, 0), 100000),
  }))
  if (items.some(i => !i.id || !i.name)) return null
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  return { customer, items, total }
}

async function notifyTelegram(order) {
  if (!TG_TOKEN || !TG_CHAT) return
  const lines = order.items.map(i => `• ${i.name} (${i.size}) ×${i.qty} — $${i.price * i.qty}`)
  const text =
    `🖤 New MONOCHROME order ${order.id}\n\n${lines.join('\n')}\n\nTotal: $${order.total}\n\n` +
    `${order.customer.name}\n${order.customer.email}\n${order.customer.address}`
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text }),
    })
  } catch (err) {
    console.error('telegram notification failed:', err)
  }
}

function requireAdmin(req, res, next) {
  const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '')
  const ok =
    ADMIN_TOKEN.length > 0 &&
    token.length === ADMIN_TOKEN.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(ADMIN_TOKEN))
  if (!ok) return res.status(401).json({ error: 'unauthorized' })
  next()
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/orders', async (req, res) => {
  const parsed = parseOrder(req.body)
  if (!parsed) return res.status(400).json({ error: 'invalid order' })
  const order = {
    id: `MC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
    ...parsed,
  }
  try {
    await ordersStore.add(order)
  } catch (err) {
    console.error('order save failed:', err)
    return res.status(500).json({ error: 'storage failed' })
  }
  notifyTelegram(order) // fire-and-forget
  res.status(201).json({ id: order.id })
})

app.get('/api/orders', requireAdmin, async (_req, res) => {
  try {
    res.json(await ordersStore.list())
  } catch (err) {
    console.error('order list failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

app.patch('/api/orders/:id', requireAdmin, async (req, res) => {
  const status = req.body?.status
  if (status !== 'new' && status !== 'done') return res.status(400).json({ error: 'invalid status' })
  try {
    await ordersStore.setStatus(req.params.id, status)
    res.status(204).end()
  } catch (err) {
    if (err.code === 404 || err.code === 5) return res.status(404).json({ error: 'not found' })
    console.error('order update failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

app.use('/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y' }))
app.use('/media', express.static(path.join(DIST, 'media'), { maxAge: '7d' }))
app.use(express.static(DIST, { maxAge: '1h' }))
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not found' })
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, () => console.log(`MONOCHROME server on :${PORT}`))
