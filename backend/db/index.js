import pg from 'pg'

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) =>
  value === null ? null : Number(value)
)

const { Pool } = pg

export const pool = new Pool({
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
})

pool.on('error', (error) => {
  console.error('Erro inesperado no pool do PostgreSQL:', error)
})

export function query(text, params) {
  return pool.query(text, params)
}

export async function transaction(callback) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function checkConnection() {
  const result = await query('SELECT NOW() AS now')
  return result.rows[0].now
}