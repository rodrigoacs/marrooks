import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { pool, query } from './index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DROP_SQL = `
  DROP TABLE IF EXISTS order_items CASCADE;
  DROP TABLE IF EXISTS orders CASCADE;
  DROP TABLE IF EXISTS addresses CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  DROP TABLE IF EXISTS product_images CASCADE;
  DROP TABLE IF EXISTS products CASCADE;
  DROP TABLE IF EXISTS categories CASCADE;
`

async function migrate() {
  const shouldDrop = process.argv.includes('--drop')

  if (shouldDrop) {
    console.log('⚠️  Removendo tabelas existentes (--drop)...')
    await query(DROP_SQL)
  }

  const schema = await readFile(join(__dirname, 'schema.sql'), 'utf8')
  await query(schema)

  console.log('✅ Schema aplicado com sucesso.')
}

migrate()
  .catch((error) => {
    console.error('❌ Erro ao aplicar o schema:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())