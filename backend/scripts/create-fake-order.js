import { parseArgs } from 'node:util'
import crypto from 'node:crypto'

import { pool, query, transaction } from '../db/index.js'

const { values } = parseArgs({
  options: {
    email: { type: 'string' }, // dono do pedido — padrão: primeiro usuário cadastrado
    status: { type: 'string', default: 'paid' },
  },
})

const VALID_STATUSES = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled']

function generateReference() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `MRK-${stamp}-${random}`
}

async function findUser() {
  if (values.email) {
    const result = await query('SELECT id, name, email FROM users WHERE email = $1', [
      values.email.trim().toLowerCase(),
    ])
    if (result.rows.length === 0) {
      throw new Error(`Nenhum usuário encontrado com o e-mail ${values.email}`)
    }
    return result.rows[0]
  }

  const result = await query('SELECT id, name, email FROM users ORDER BY id LIMIT 1')
  if (result.rows.length === 0) {
    throw new Error('Nenhum usuário cadastrado ainda — crie uma conta pelo site ou rode create-admin primeiro.')
  }
  return result.rows[0]
}

async function pickOrderLines() {
  // Pega até 2 produtos ativos, com a primeira variação ativa de cada um (se tiver).
  const productsResult = await query(
    `SELECT id, slug, name, price FROM products WHERE active = TRUE ORDER BY id LIMIT 2`
  )

  if (productsResult.rows.length === 0) {
    throw new Error('Nenhum produto cadastrado ainda — rode o seed (npm run db:seed) primeiro.')
  }

  const lines = []
  for (const product of productsResult.rows) {
    const variantResult = await query(
      `SELECT id, series, name, author
       FROM product_variants
       WHERE product_id = $1 AND active = TRUE
       ORDER BY id LIMIT 1`,
      [product.id]
    )
    const variant = variantResult.rows[0] ?? null

    lines.push({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      unitPrice: product.price,
      quantity: 1,
      variantId: variant?.id ?? null,
      variantSeries: variant?.series ?? null,
      variantName: variant?.name ?? null,
      variantAuthor: variant?.author ?? null,
    })
  }

  return lines
}

async function createFakeOrder() {
  const status = values.status
  if (!VALID_STATUSES.includes(status)) {
    console.error(`Status inválido. Use um de: ${VALID_STATUSES.join(', ')}`)
    process.exitCode = 1
    return
  }

  const user = await findUser()
  const lines = await pickOrderLines()

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const shippingCost = 15.9
  const total = subtotal + shippingCost
  const reference = generateReference()
  const isPaid = status !== 'pending'

  const order = await transaction(async (client) => {
    const orderResult = await client.query(
      `INSERT INTO orders
         (reference, user_id, status, subtotal, shipping_cost, total,
          customer_name, customer_email, customer_phone, customer_document,
          shipping_postal_code, shipping_street, shipping_number, shipping_complement,
          shipping_district, shipping_city, shipping_state,
          shipping_service_id, shipping_service_name, shipping_company, shipping_deadline,
          payment_id, payment_status, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
               $18, $19, $20, $21, $22, $23, $24)
       RETURNING *`,
      [
        reference,
        user.id,
        status,
        subtotal,
        shippingCost,
        total,
        user.name,
        user.email,
        '11999999999',
        '12345678909',
        '01310-100',
        'Avenida Paulista',
        '1000',
        'Apto 101',
        'Bela Vista',
        'São Paulo',
        'SP',
        'fake-service-1',
        'PAC',
        'Correios',
        7,
        isPaid ? `FAKE-${reference}` : null,
        isPaid ? 'approved' : null,
        isPaid ? 'fake_card' : null,
      ]
    )

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, product_variant_id, product_name, product_slug,
            variant_series, variant_name, variant_author, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          orderResult.rows[0].id,
          line.productId,
          line.variantId,
          line.productName,
          line.productSlug,
          line.variantSeries,
          line.variantName,
          line.variantAuthor,
          line.unitPrice,
          line.quantity,
        ]
      )
    }

    return orderResult.rows[0]
  })

  console.log(`✅ Pedido fake criado: ${order.reference} (status: ${order.status}, total: R$ ${order.total})`)
  console.log(`   Dono do pedido: ${user.name} <${user.email}>`)
  console.log(`   Itens: ${lines.map((line) => line.productName).join(', ')}`)
}

createFakeOrder()
  .catch((error) => {
    console.error('❌ Erro ao criar pedido fake:', error.message)
    process.exitCode = 1
  })
  .finally(() => pool.end())