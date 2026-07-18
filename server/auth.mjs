import crypto from 'node:crypto'

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
export const SESSION_COOKIE = 'mc_session'

// --- passwords: scrypt with per-user salt ---

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { salt, hash }
}

export function verifyPassword(password, salt, hash) {
  const candidate = crypto.scryptSync(password, salt, 64)
  const stored = Buffer.from(hash, 'hex')
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored)
}

// --- sessions: HMAC-signed token in an httpOnly cookie ---

const b64url = buf => Buffer.from(buf).toString('base64url')

function sign(payload) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
}

export function createSessionToken(uid) {
  const payload = b64url(JSON.stringify({ uid, exp: Date.now() + SESSION_TTL_MS }))
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null
  const [payload, signature] = token.split('.')
  const expected = sign(payload)
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (typeof data.uid !== 'string' || Date.now() > data.exp) return null
    return { uid: data.uid }
  } catch {
    return null
  }
}

export function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map(part => part.trim().split('='))
      .filter(pair => pair.length === 2),
  )
}

export function sessionCookie(token, { secure }) {
  const base = `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`
  return secure ? `${base}; Secure` : base
}

export function clearSessionCookie({ secure }) {
  const base = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  return secure ? `${base}; Secure` : base
}

// --- MONO Club bonus rules (USD lifetime spend thresholds) ---
// Keep in sync with src/utils/bonus.ts on the client.

export function bonusLevel(totalSpentUsd) {
  if (totalSpentUsd >= 480) return { name: 'black', rate: 0.07 }
  if (totalSpentUsd >= 120) return { name: 'graphite', rate: 0.05 }
  return { name: 'silver', rate: 0.03 }
}

export const UAH_RATE = 42
export const REGISTRATION_BONUS = 100

export function pointsForOrder(totalUsd, totalSpentUsdBefore) {
  const { rate } = bonusLevel(totalSpentUsdBefore)
  return Math.round(totalUsd * UAH_RATE * rate)
}
