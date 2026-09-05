import crypto from 'node:crypto'

import express from 'express'

import { query, transaction } from '../db/index.js'
import { badRequest, forbidden, notFound } from '../lib/errors.js'
import { mapOrder } from '../lib/orders.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const STATE_PATTERN = /^[A-Za-z]{2}$/

function generateReference() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `MRK-${stamp}-${random}`
}

// POST /api/orders
// Cria o pedido (e seus itens) com preços e estoque revalidados no banco —
// o valor final nunca vem do que o cliente mandou, só o que ele *pediu*.
router.post('/', requireAuth, async (req, res) => {
  const { items, shipping, customer, address } = req.body ?? {}

  if (!Array.isArray(items) || items.length === 0) {
    throw badRequest('O carrinho está vazio')
  }

  const name = customer?.name?.trim()
  const email = customer?.email?.trim().toLowerCase()
  if (!name || name.length < 2) throw badRequest('Informe o nome do comprador')
  if (!email) throw badRequest('Informe o e-mail do comprador')

  const postalCode = address?.postalCode?.replace(/\D/g, '')
  const street = address?.street?.trim()
  const number = address?.number?.trim()
  const district = address?.district?.trim()
  const city = address?.city?.trim()
  const state = address?.state?.trim().toUpperCase()

  if (!postalCode || postalCode.length !== 8) throw badRequest('Informe um CEP válido')
  if (!street) throw badRequest('Informe a rua do endereço de entrega')
  if (!number) throw badRequest('Informe o número do endereço de entrega')
  if (!district) throw badRequest('Informe o bairro do endereço de entrega')
  if (!city) throw badRequest('Informe a cidade do endereço de entrega')
  if (!state || !STATE_PATTERN.test(state)) throw badRequest('Informe o estado (UF) do endereço de entrega')

  if (!shipping?.serviceId || !shipping?.price) {
    throw badRequest('Selecione uma opção de frete')
  }
  const shippingCost = Number(shipping.price)
  if (!Number.isFinite(shippingCost) || shippingCost < 0) {
    throw badRequest('Frete inválido — calcule novamente')
  }

  // Deduplica por slug e valida quantidades antes de tocar no banco.
  const requested = new Map()
  for (const item of items) {
    const slug = item?.slug
    const quantity = Number(item?.quantity)
    if (!slug || !Number.isInteger(quantity) || quantity <= 0) {
      throw badRequest('Item de carrinho inválido')
    }
    requested.set(slug, (requested.get(slug) ?? 0) + quantity)
  }

  const slugs = [...requested.keys()]
  const productsResult = await query(
    `SELECT id, slug, name, price, stock FROM products WHERE slug = ANY($1) AND active = TRUE`,
    [slugs]
  )

  const productsBySlug = new Map(productsResult.rows.map((row) => [row.slug, row]))

  for (const slug of slugs) {
    const product = productsBySlug.get(slug)
    if (!product) throw badRequest(`Produto "${slug}" não está mais disponível`)
    if (product.stock < requested.get(slug)) {
      throw badRequest(`Estoque insuficiente para "${product.name}"`)
    }
  }

  const orderItems = slugs.map((slug) => {
    const product = productsBySlug.get(slug)
    const quantity = requested.get(slug)
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unitPrice: product.price,
      quantity,
    }
  })

  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const total = subtotal + shippingCost
  const reference = generateReference()

  const order = await transaction(async (client) => {
    const orderResult = await client.query(
      `INSERT INTO orders
         (reference, user_id, status, subtotal, shipping_cost, total,
          customer_name, customer_email, customer_phone, customer_document,
          shipping_postal_code, shipping_street, shipping_number, shipping_complement,
          shipping_district, shipping_city, shipping_state,
          shipping_service_id, shipping_service_name, shipping_company, shipping_deadline)
       VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        reference,
        req.user.id,
        subtotal,
        shippingCost,
        total,
        name,
        email,
        customer?.phone?.trim() || null,
        customer?.document?.trim() || null,
        postalCode,
        street,
        number,
        address?.complement?.trim() || null,
        district,
        city,
        state,
        shipping.serviceId,
        shipping.name ?? null,
        shipping.company ?? null,
        shipping.deliveryTime ?? null,
      ]
    )

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_slug, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderResult.rows[0].id, item.productId, item.name, item.slug, item.unitPrice, item.quantity]
      )
    }

    return orderResult.rows[0]
  })

  res.status(201).json({ order: mapOrder(order) })
})

// GET /api/orders/:reference
router.get('/:reference', requireAuth, async (req, res) => {
  const result = await query('SELECT * FROM orders WHERE reference = $1', [req.params.reference])
  const order = result.rows[0]

  if (!order) throw notFound('Pedido não encontrado')
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    throw forbidden('Esse pedido não pertence a você')
  }

  const itemsResult = await query(
    `SELECT product_name, product_slug, unit_price, quantity FROM order_items WHERE order_id = $1`,
    [order.id]
  )

  res.json({
    order: {
      ...mapOrder(order),
      items: itemsResult.rows.map((row) => ({
        name: row.product_name,
        slug: row.product_slug,
        unitPrice: row.unit_price,
        quantity: row.quantity,
      })),
    },
  })
})

export default router