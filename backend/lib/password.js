import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const KEY_LENGTH = 64
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const derivedKey = await scryptAsync(password.normalize('NFKC'), salt, KEY_LENGTH, PARAMS)

  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64url'),
    derivedKey.toString('base64url'),
  ].join('$')
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false

  const [scheme, n, r, p, saltBase64, keyBase64] = stored.split('$')
  if (scheme !== 'scrypt' || !saltBase64 || !keyBase64) return false

  const salt = Buffer.from(saltBase64, 'base64url')
  const expected = Buffer.from(keyBase64, 'base64url')

  const derivedKey = await scryptAsync(password.normalize('NFKC'), salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  })

  return derivedKey.length === expected.length && timingSafeEqual(derivedKey, expected)
}