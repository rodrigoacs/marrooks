import { randomBytes } from 'node:crypto'

import express from 'express'

import { query } from '../db/index.js'
import { authCookieOptions, AUTH_COOKIE, clearAuthCookieOptions } from '../lib/cookies.js'
import { badRequest, notFound, unauthorized } from '../lib/errors.js'
import { signToken } from '../lib/jwt.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

const DUMMY_HASH = await hashPassword(randomBytes(16).toString('hex'))

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    document: row.document,
    role: row.role,
  }
}

function issueSession(res, user) {
  const token = signToken({ sub: user.id, role: user.role, email: user.email })
  res.cookie(AUTH_COOKIE, token, authCookieOptions())
  return token
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const name = req.body?.name?.trim()
  const email = req.body?.email?.trim().toLowerCase()
  const { password, phone, document } = req.body ?? {}

  if (!name || name.length < 2) throw badRequest('Informe seu nome completo')
  if (!email || !EMAIL_PATTERN.test(email)) throw badRequest('Informe um e-mail válido')
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw badRequest(`A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`)
  }

  const passwordHash = await hashPassword(password)

  // Violação de unicidade (código 23505) vira 409 no handler central
  const result = await query(
    `INSERT INTO users (name, email, password_hash, phone, document)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, document, role`,
    [name, email, passwordHash, phone ?? null, document ?? null]
  )

  const user = mapUser(result.rows[0])
  issueSession(res, user)

  res.status(201).json({ user })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase()
  const { password } = req.body ?? {}

  if (!email || !password) throw badRequest('Informe e-mail e senha')

  const result = await query(
    `SELECT id, name, email, password_hash, phone, document, role
     FROM users WHERE email = $1`,
    [email]
  )

  const row = result.rows[0]
  const valid = await verifyPassword(password, row?.password_hash ?? DUMMY_HASH)

  if (!row || !valid) throw unauthorized('E-mail ou senha inválidos')

  const user = mapUser(row)
  issueSession(res, user)

  res.json({ user })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE, clearAuthCookieOptions())
  res.status(204).end()
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const result = await query(
    `SELECT id, name, email, phone, document, role FROM users WHERE id = $1`,
    [req.user.id]
  )

  if (result.rows.length === 0) {
    res.clearCookie(AUTH_COOKIE, clearAuthCookieOptions())
    throw notFound('Usuário não encontrado')
  }

  res.json({ user: mapUser(result.rows[0]) })
})

// PATCH /api/auth/me
router.patch('/me', requireAuth, async (req, res) => {
  const name = req.body?.name?.trim()
  const { phone, document } = req.body ?? {}

  if (name !== undefined && (!name || name.length < 2)) {
    throw badRequest('Informe seu nome completo')
  }

  const result = await query(
    `UPDATE users
     SET name = COALESCE($2, name),
         phone = COALESCE($3, phone),
         document = COALESCE($4, document)
     WHERE id = $1
     RETURNING id, name, email, phone, document, role`,
    [req.user.id, name ?? null, phone ?? null, document ?? null]
  )

  res.json({ user: mapUser(result.rows[0]) })
})

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {}

  if (!currentPassword || !newPassword) throw badRequest('Informe a senha atual e a nova senha')
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw badRequest(`A nova senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`)
  }

  const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
  const valid = await verifyPassword(currentPassword, result.rows[0]?.password_hash ?? DUMMY_HASH)

  if (!valid) throw unauthorized('Senha atual incorreta')

  await query('UPDATE users SET password_hash = $2 WHERE id = $1', [
    req.user.id,
    await hashPassword(newPassword),
  ])

  res.status(204).end()
})

export default router