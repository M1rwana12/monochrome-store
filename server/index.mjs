import express from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SESSION_COOKIE,
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  parseCookies,
  pointsForOrder,
  REGISTRATION_BONUS,
  sessionCookie,
  verifyPassword,
  verifySessionToken,
  bonusLevel,
} from './auth.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const PORT = process.env.PORT || 8080
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ''
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || ''
const IS_PROD = Boolean(process.env.K_SERVICE)

// Firestore on Cloud Run (K_SERVICE is set there); in-memory store for local runs
const useFirestore = Boolean(process.env.K_SERVICE || process.env.USE_FIRESTORE)
let store
if (useFirestore) {
  const { Firestore } = await import('@google-cloud/firestore')
  const db = new Firestore()
  const orders = db.collection('orders')
  const users = db.collection('users')
  const bonusTx = db.collection('bonusTransactions')
  store = {
    async addOrder(order) {
      await orders.doc(order.id).set(order)
    },
    async listOrders() {
      const snap = await orders.orderBy('createdAt', 'desc').limit(100).get()
      return snap.docs.map(d => d.data())
    },
    async listOrdersByUid(uid) {
      const snap = await orders.where('uid', '==', uid).limit(100).get()
      return snap.docs
        .map(d => d.data())
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    },
    async setOrderStatus(id, status) {
      await orders.doc(id).update({ status })
    },
    async getUserByEmail(email) {
      const snap = await users.where('email', '==', email).limit(1).get()
      return snap.empty ? null : snap.docs[0].data()
    },
    async getUser(uid) {
      const doc = await users.doc(uid).get()
      return doc.exists ? doc.data() : null
    },
    async createUser(user) {
      await users.doc(user.uid).set(user)
    },
    async updateUser(uid, patch) {
      await users.doc(uid).update(patch)
    },
    async addBonusTx(tx) {
      await bonusTx.doc(tx.id).set(tx)
    },
    async listBonusTx(uid) {
      const snap = await bonusTx.where('uid', '==', uid).limit(50).get()
      return snap.docs
        .map(d => d.data())
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    },
  }
  console.log('store: Firestore')
} else {
  const mem = { orders: [], users: new Map(), bonusTx: [] }
  store = {
    async addOrder(order) {
      mem.orders.unshift(order)
    },
    async listOrders() {
      return mem.orders.slice(0, 100)
    },
    async listOrdersByUid(uid) {
      return mem.orders.filter(o => o.uid === uid)
    },
    async setOrderStatus(id, status) {
      const order = mem.orders.find(o => o.id === id)
      if (!order) throw Object.assign(new Error('not found'), { code: 404 })
      order.status = status
    },
    async getUserByEmail(email) {
      for (const user of mem.users.values()) if (user.email === email) return user
      return null
    },
    async getUser(uid) {
      return mem.users.get(uid) ?? null
    },
    async createUser(user) {
      mem.users.set(user.uid, user)
    },
    async updateUser(uid, patch) {
      Object.assign(mem.users.get(uid) ?? {}, patch)
    },
    async addBonusTx(tx) {
      mem.bonusTx.unshift(tx)
    },
    async listBonusTx(uid) {
      return mem.bonusTx.filter(t => t.uid === uid)
    },
  }
  console.log('store: in-memory (local mode)')
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function sessionUid(req) {
  const cookies = parseCookies(req.get('cookie'))
  const session = verifySessionToken(cookies[SESSION_COOKIE])
  return session?.uid ?? null
}

function requireUser(req, res, next) {
  const uid = sessionUid(req)
  if (!uid) return res.status(401).json({ error: 'unauthorized' })
  req.uid = uid
  next()
}

function publicUser(user) {
  return {
    email: user.email,
    name: user.name,
    points: user.points,
    totalSpentUsd: user.totalSpentUsd,
    level: bonusLevel(user.totalSpentUsd).name,
  }
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// --- auth ---

app.post('/api/auth/register', async (req, res) => {
  const email = str(req.body?.email, 200).toLowerCase()
  const name = str(req.body?.name, 100)
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'invalid email' })
  if (password.length < 8) return res.status(400).json({ error: 'password too short' })
  try {
    if (await store.getUserByEmail(email)) return res.status(409).json({ error: 'email taken' })
    const { salt, hash } = hashPassword(password)
    const user = {
      uid: crypto.randomBytes(12).toString('hex'),
      email,
      name,
      salt,
      hash,
      favorites: [],
      points: REGISTRATION_BONUS,
      totalSpentUsd: 0,
      createdAt: new Date().toISOString(),
    }
    await store.createUser(user)
    await store.addBonusTx({
      id: crypto.randomBytes(8).toString('hex'),
      uid: user.uid,
      type: 'register',
      points: REGISTRATION_BONUS,
      createdAt: user.createdAt,
    })
    res.setHeader('Set-Cookie', sessionCookie(createSessionToken(user.uid), { secure: IS_PROD }))
    res.status(201).json(publicUser(user))
  } catch (err) {
    console.error('register failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const email = str(req.body?.email, 200).toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  try {
    const user = await store.getUserByEmail(email)
    if (!user || !verifyPassword(password, user.salt, user.hash)) {
      return res.status(401).json({ error: 'wrong credentials' })
    }
    res.setHeader('Set-Cookie', sessionCookie(createSessionToken(user.uid), { secure: IS_PROD }))
    res.json(publicUser(user))
  } catch (err) {
    console.error('login failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', clearSessionCookie({ secure: IS_PROD }))
  res.status(204).end()
})

// --- account ---

app.get('/api/me', requireUser, async (req, res) => {
  try {
    const user = await store.getUser(req.uid)
    if (!user) {
      res.setHeader('Set-Cookie', clearSessionCookie({ secure: IS_PROD }))
      return res.status(401).json({ error: 'unauthorized' })
    }
    const transactions = await store.listBonusTx(req.uid)
    res.json({ ...publicUser(user), transactions: transactions.slice(0, 20) })
  } catch (err) {
    console.error('me failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

app.get('/api/me/orders', requireUser, async (req, res) => {
  try {
    res.json(await store.listOrdersByUid(req.uid))
  } catch (err) {
    console.error('my orders failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

app.get('/api/me/favorites', requireUser, async (req, res) => {
  try {
    const user = await store.getUser(req.uid)
    res.json(user?.favorites ?? [])
  } catch (err) {
    console.error('favorites get failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

app.put('/api/me/favorites', requireUser, async (req, res) => {
  const ids = Array.isArray(req.body) ? req.body.slice(0, 100).map(v => str(v, 20)).filter(Boolean) : null
  if (!ids) return res.status(400).json({ error: 'invalid favorites' })
  try {
    await store.updateUser(req.uid, { favorites: ids })
    res.status(204).end()
  } catch (err) {
    console.error('favorites put failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

// --- orders ---

app.post('/api/orders', async (req, res) => {
  const parsed = parseOrder(req.body)
  if (!parsed) return res.status(400).json({ error: 'invalid order' })
  const uid = sessionUid(req)
  const order = {
    id: `MC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
    uid,
    ...parsed,
  }
  let pointsEarned = 0
  try {
    await store.addOrder(order)
    if (uid) {
      const user = await store.getUser(uid)
      if (user) {
        pointsEarned = pointsForOrder(order.total, user.totalSpentUsd)
        await store.addBonusTx({
          id: crypto.randomBytes(8).toString('hex'),
          uid,
          type: 'order',
          orderId: order.id,
          points: pointsEarned,
          createdAt: order.createdAt,
        })
        await store.updateUser(uid, {
          points: (user.points ?? 0) + pointsEarned,
          totalSpentUsd: (user.totalSpentUsd ?? 0) + order.total,
        })
      }
    }
  } catch (err) {
    console.error('order save failed:', err)
    return res.status(500).json({ error: 'storage failed' })
  }
  notifyTelegram(order) // fire-and-forget
  res.status(201).json({ id: order.id, pointsEarned })
})

app.get('/api/orders', requireAdmin, async (_req, res) => {
  try {
    res.json(await store.listOrders())
  } catch (err) {
    console.error('order list failed:', err)
    res.status(500).json({ error: 'storage failed' })
  }
})

app.patch('/api/orders/:id', requireAdmin, async (req, res) => {
  const status = req.body?.status
  if (status !== 'new' && status !== 'done') return res.status(400).json({ error: 'invalid status' })
  try {
    await store.setOrderStatus(req.params.id, status)
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
