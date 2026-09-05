import { parseArgs } from 'node:util'

import { pool, query } from '../db/index.js'
import { hashPassword } from '../lib/password.js'

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    password: { type: 'string' },
    name: { type: 'string', default: 'Administração Marrooks' },
  },
})

async function createAdmin() {
  const email = values.email?.trim().toLowerCase()
  const { password, name } = values

  if (!email || !password) {
    console.error('Uso: npm run create-admin -- --email=voce@email.com --password=senhaforte')
    process.exitCode = 1
    return
  }

  if (password.length < 8) {
    console.error('A senha precisa ter ao menos 8 caracteres.')
    process.exitCode = 1
    return
  }

  const passwordHash = await hashPassword(password)

  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'admin',
           name = EXCLUDED.name
     RETURNING id, email`,
    [name, email, passwordHash]
  )

  console.log(`✅ Admin pronto: ${result.rows[0].email} (id ${result.rows[0].id})`)
}

createAdmin()
  .catch((error) => {
    console.error('❌ Erro ao criar admin:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())