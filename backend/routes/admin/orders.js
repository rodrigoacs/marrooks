import express from 'express'

import { query } from '../../db/index.js'
import { badRequest, notFound } from '../../lib/errors.js'
import { mapOrder } from '../../lib/orders.js'
import { requireAdmin } from '../../middleware/auth.js'

const router = express.Router()

router.use(requireAdmin)

const VALID_STATUSES = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled']

// GET /api/admin/orders
router.get('/', async (req, res) => {
  const { status } = req.query

  const conditions = []
  const params = []

  if (status) {
    params.push(status)
    conditions.push(`status = $${params.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT 200`,
    params
  )

  res.json({ orders: result.rows.map(mapOrder) })
})

// GET /api/admin/orders/:reference
router.get('/:reference', async (req, res) => {
  const result = await query('SELECT * FROM orders WHERE reference = $1', [req.params.reference])
  const order = result.rows[0]
  if (!order) throw notFound('Pedido não encontrado')

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

// PATCH /api/admin/orders/:reference
router.patch('/:reference', async (req, res) => {
  const { status, trackingCode } = req.body ?? {}

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw badRequest('Status inválido')
  }

  const existing = await query('SELECT id FROM orders WHERE reference = $1', [req.params.reference])
  if (existing.rows.length === 0) throw notFound('Pedido não encontrado')

  const result = await query(
    `UPDATE orders
     SET status = COALESCE($2, status),
         tracking_code = COALESCE($3, tracking_code)
     WHERE reference = $1
     RETURNING *`,
    [req.params.reference, status ?? null, trackingCode?.trim() || null]
  )

  res.json({ order: mapOrder(result.rows[0]) })
})

export default router