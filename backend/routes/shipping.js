import express from 'express'

import { query } from '../db/index.js'
import { badRequest } from '../lib/errors.js'

const router = express.Router()

const MELHOR_ENVIO_BASE_URL =
  process.env.MELHOR_ENVIO_BASE_URL || 'https://sandbox.melhorenvio.com.br'

// POST /api/shipping/calculate
// Recebe { toPostalCode, items: [{ slug, quantity }] } — dimensões, peso e
// valor de seguro vêm sempre do banco, nunca do que o cliente mandar.
router.post('/calculate', async (req, res) => {
  const { toPostalCode, items } = req.body ?? {}

  if (!toPostalCode) throw badRequest('CEP de destino é obrigatório')
  if (!Array.isArray(items) || items.length === 0) throw badRequest('Informe os itens do carrinho')

  if (!process.env.MELHOR_ENVIO_TOKEN) {
    console.error('MELHOR_ENVIO_TOKEN não configurado no .env')
    return res.status(500).json({ error: 'Token do Melhor Envio não configurado' })
  }

  if (!process.env.MELHOR_ENVIO_USER_AGENT) {
    console.error('MELHOR_ENVIO_USER_AGENT não configurado no .env')
    return res.status(500).json({ error: 'User-Agent do Melhor Envio não configurado' })
  }

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
    `SELECT slug, name, price, width, height, length, weight
     FROM products WHERE slug = ANY($1) AND active = TRUE`,
    [slugs]
  )

  const productsBySlug = new Map(productsResult.rows.map((row) => [row.slug, row]))

  for (const slug of slugs) {
    if (!productsBySlug.has(slug)) {
      throw badRequest(`Produto "${slug}" não está mais disponível`)
    }
  }

  const products = slugs.map((slug) => {
    const product = productsBySlug.get(slug)
    return {
      id: product.slug,
      width: Number(product.width),
      height: Number(product.height),
      length: Number(product.length),
      weight: Number(product.weight),
      insurance_value: Number(product.price),
      quantity: requested.get(slug),
    }
  })

  const requestBody = {
    from: { postal_code: process.env.MELHOR_ENVIO_FROM_CEP },
    to: { postal_code: toPostalCode },
    products,
  }

  const response = await fetch(`${MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/calculate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
      'User-Agent': process.env.MELHOR_ENVIO_USER_AGENT,
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Erro Melhor Envio:', response.status, data)

    if (response.status === 401) {
      return res.status(502).json({
        error:
          'Não autenticado no Melhor Envio. Verifique se o token é do mesmo ambiente da URL configurada (sandbox x produção) e se não expirou.',
      })
    }

    return res.status(response.status).json({ error: 'Erro ao calcular frete', details: data })
  }

  const options = data
    .filter((option) => !option.error)
    .map((option) => ({
      id: option.id,
      name: option.name,
      company: option.company?.name,
      price: Number(option.price),
      deliveryTime: option.delivery_time,
    }))

  const unavailable = data
    .filter((option) => option.error)
    .map((option) => ({
      name: option.name,
      company: option.company?.name,
      error: option.error,
    }))

  if (unavailable.length > 0) {
    console.log('--- Serviços indisponíveis para essa cotação ---')
    console.log(JSON.stringify(unavailable, null, 2))
  }

  res.json({ options, unavailable })
})

export default router