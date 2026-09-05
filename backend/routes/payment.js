import crypto from 'node:crypto'

import express from 'express'
import { MercadoPagoConfig, Order } from 'mercadopago'

import { query } from '../db/index.js'
import { badRequest, forbidden, notFound } from '../lib/errors.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
})

const mpOrder = new Order(client)

// Mapeia o status devolvido pela Order API do Mercado Pago para o status
// interno do pedido. Só "processed" confirma o pagamento; qualquer outra
// coisa mantém o pedido como pendente até o webhook (Fase 4) resolver.
function resolveOrderStatus(mpStatus) {
  return mpStatus === 'processed' ? 'paid' : 'pending'
}

// POST /api/payment/process_payment
// O valor cobrado é sempre o total já salvo no pedido — o que vem em
// formData.transaction_amount nunca é usado para montar a cobrança.
router.post('/process_payment', requireAuth, async (req, res) => {
  const { orderReference, formData, additionalData } = req.body ?? {}

  if (!orderReference) throw badRequest('Informe o pedido a ser pago')
  if (!formData?.payer?.email) throw badRequest('Dados do pagador ausentes')

  const orderResult = await query('SELECT * FROM orders WHERE reference = $1', [orderReference])
  const order = orderResult.rows[0]

  if (!order) throw notFound('Pedido não encontrado')
  if (order.user_id !== req.user.id) throw forbidden('Esse pedido não pertence a você')
  if (order.status !== 'pending') throw badRequest('Esse pedido já foi processado')

  const body = {
    type: 'online',
    processing_mode: 'automatic',
    total_amount: String(order.total),
    external_reference: order.reference,
    payer: {
      email: formData.payer.email,
    },
    transactions: {
      payments: [
        {
          amount: String(order.total),
          payment_method: {
            id: formData.payment_method_id,
            type: additionalData?.paymentTypeId,
            token: formData.token,
            installments: formData.installments,
          },
        },
      ],
    },
  }

  const result = await mpOrder.create({
    body,
    requestOptions: {
      idempotencyKey: crypto.randomUUID(),
    },
  })

  const newStatus = resolveOrderStatus(result.status)

  await query(
    `UPDATE orders
     SET status = $2, payment_id = $3, payment_status = $4, payment_method = $5
     WHERE id = $1`,
    [order.id, newStatus, result.id, result.status, formData.payment_method_id]
  )

  if (newStatus === 'paid') {
    await query(
      `UPDATE products p
       SET stock = p.stock - oi.quantity
       FROM order_items oi
       WHERE oi.order_id = $1 AND oi.product_id = p.id`,
      [order.id]
    )
  }

  res.status(201).json({
    id: result.id,
    status: result.status,
    statusDetail: result.status_detail,
    orderReference: order.reference,
    orderStatus: newStatus,
  })
})

router.get('/public_key', (req, res) => {
  res.json({ publicKey: process.env.MERCADOPAGO_PUBLIC_KEY })
})

export default router