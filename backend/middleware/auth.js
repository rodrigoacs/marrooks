import { AUTH_COOKIE } from '../lib/cookies.js'
import { forbidden, unauthorized } from '../lib/errors.js'
import { verifyToken } from '../lib/jwt.js'

export function authenticate(req, res, next) {
  const header = req.headers.authorization
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null
  const token = req.cookies?.[AUTH_COOKIE] ?? bearer

  const payload = token ? verifyToken(token) : null

  req.user = payload ? { id: payload.sub, role: payload.role, email: payload.email } : null

  next()
}

export function requireAuth(req, res, next) {
  if (!req.user) throw unauthorized('Faça login para continuar')
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.user) throw unauthorized('Faça login para continuar')
  if (req.user.role !== 'admin') throw forbidden('Área restrita à administração')
  next()
}