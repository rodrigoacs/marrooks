import { createHmac, timingSafeEqual } from 'node:crypto'

const HEADER = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET ausente ou curto demais (mínimo 32 caracteres).')
  }
  return secret
}

function sign(data, secret) {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function signToken(payload, { expiresInSeconds = DEFAULT_TTL_SECONDS } = {}) {
  const secret = getSecret()
  const issuedAt = Math.floor(Date.now() / 1000)

  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: issuedAt, exp: issuedAt + expiresInSeconds })
  ).toString('base64url')

  const data = `${HEADER}.${body}`
  return `${data}.${sign(data, secret)}`
}

export function verifyToken(token) {
  if (typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [header, body, signature] = parts

  const expected = Buffer.from(sign(`${header}.${body}`, getSecret()), 'base64url')
  const received = Buffer.from(signature, 'base64url')

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

  let payload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (typeof payload?.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) return null

  return payload
}

export const TOKEN_TTL_SECONDS = DEFAULT_TTL_SECONDS