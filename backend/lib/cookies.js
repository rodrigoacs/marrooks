import { TOKEN_TTL_SECONDS } from './jwt.js'

export const AUTH_COOKIE = 'marrooks_token'

export function cookieParser(req, res, next) {
  const header = req.headers.cookie

  if (!header) {
    req.cookies = {}
    return next()
  }

  req.cookies = Object.fromEntries(
    header
      .split(';')
      .map((pair) => {
        const separator = pair.indexOf('=')
        if (separator === -1) return null

        const key = pair.slice(0, separator).trim()
        const value = pair.slice(separator + 1).trim()
        if (!key) return null

        try {
          return [key, decodeURIComponent(value)]
        } catch {
          return [key, value]
        }
      })
      .filter(Boolean)
  )

  next()
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS * 1000,
  }
}

export function clearAuthCookieOptions() {
  const { maxAge, ...rest } = authCookieOptions()
  return rest
}