import express from 'express'

import { query } from '../../db/index.js'
import { badRequest, notFound } from '../../lib/errors.js'

const router = express.Router({ mergeParams: true })

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SIZE_CATEGORIES = ['P', 'M', 'G']

function mapVariant(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    series: row.series,
    author: row.author,
    image: row.image_url ? { url: row.image_url, alt: row.image_alt } : null,
    pageCount: row.page_count,
    sizeCategory: row.size_category,
    active: row.active,
  }
}

function validatePayload(body, { partial } = {}) {
  const errors = {}
  const data = {}

  if (!partial || body.slug !== undefined) {
    data.slug = body.slug?.trim().toLowerCase()
    if (!data.slug || !SLUG_PATTERN.test(data.slug)) {
      errors.slug = 'Slug inválido — use letras minúsculas, números e hífens'
    }
  }

  if (!partial || body.name !== undefined) {
    data.name = body.name?.trim()
    if (!data.name) errors.name = 'Informe o nome da variação'
  }

  if (body.series !== undefined) data.series = body.series?.trim() || null
  if (body.author !== undefined) data.author = body.author?.trim() || null
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl?.trim() || null
  if (body.imageAlt !== undefined) data.imageAlt = body.imageAlt?.trim() || null
  if (body.active !== undefined) data.active = Boolean(body.active)

  if (body.pageCount !== undefined) {
    if (body.pageCount === null || body.pageCount === '') {
      data.pageCount = null
    } else {
      const value = Number(body.pageCount)
      if (!Number.isInteger(value) || value <= 0) {
        errors.pageCount = 'Número de páginas inválido'
      } else {
        data.pageCount = value
      }
    }
  }

  if (body.sizeCategory !== undefined) {
    if (body.sizeCategory === null || body.sizeCategory === '') {
      data.sizeCategory = null
    } else if (!SIZE_CATEGORIES.includes(body.sizeCategory)) {
      errors.sizeCategory = 'Categoria inválida — use P, M ou G'
    } else {
      data.sizeCategory = body.sizeCategory
    }
  }

  if (Object.keys(errors).length > 0) throw badRequest('Dados da variação inválidos', errors)

  return data
}

async function assertProductExists(productId) {
  const result = await query('SELECT id FROM products WHERE id = $1', [productId])
  if (result.rows.length === 0) throw notFound('Produto não encontrado')
}

// GET /api/admin/products/:productId/variants
router.get('/', async (req, res) => {
  await assertProductExists(req.params.productId)

  const result = await query(
    `SELECT id, slug, series, name, author, image_url, image_alt, page_count, size_category, active
     FROM product_variants WHERE product_id = $1
     ORDER BY series NULLS LAST, name`,
    [req.params.productId]
  )

  res.json({ variants: result.rows.map(mapVariant) })
})

// POST /api/admin/products/:productId/variants
router.post('/', async (req, res) => {
  await assertProductExists(req.params.productId)
  const data = validatePayload(req.body ?? {})

  const result = await query(
    `INSERT INTO product_variants
       (product_id, slug, series, name, author, image_url, image_alt, page_count, size_category, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, slug, series, name, author, image_url, image_alt, page_count, size_category, active`,
    [
      req.params.productId,
      data.slug,
      data.series ?? null,
      data.name,
      data.author ?? null,
      data.imageUrl ?? null,
      data.imageAlt ?? null,
      data.pageCount ?? null,
      data.sizeCategory ?? null,
      data.active ?? true,
    ]
  )

  res.status(201).json({ variant: mapVariant(result.rows[0]) })
})

// PATCH /api/admin/products/:productId/variants/:variantId
router.patch('/:variantId', async (req, res) => {
  await assertProductExists(req.params.productId)
  const data = validatePayload(req.body ?? {}, { partial: true })

  const fieldMap = {
    slug: 'slug',
    series: 'series',
    name: 'name',
    author: 'author',
    imageUrl: 'image_url',
    imageAlt: 'image_alt',
    pageCount: 'page_count',
    sizeCategory: 'size_category',
    active: 'active',
  }

  const sets = []
  const params = [req.params.variantId, req.params.productId]

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      params.push(data[key])
      sets.push(`${column} = $${params.length}`)
    }
  }

  if (sets.length === 0) {
    const existing = await query(
      `SELECT id, slug, series, name, author, image_url, image_alt, page_count, size_category, active
       FROM product_variants WHERE id = $1 AND product_id = $2`,
      [req.params.variantId, req.params.productId]
    )
    if (existing.rows.length === 0) throw notFound('Variação não encontrada')
    return res.json({ variant: mapVariant(existing.rows[0]) })
  }

  const result = await query(
    `UPDATE product_variants SET ${sets.join(', ')}
     WHERE id = $1 AND product_id = $2
     RETURNING id, slug, series, name, author, image_url, image_alt, page_count, size_category, active`,
    params
  )

  if (result.rows.length === 0) throw notFound('Variação não encontrada')
  res.json({ variant: mapVariant(result.rows[0]) })
})

// DELETE /api/admin/products/:productId/variants/:variantId
// Soft delete: desativa a variação (some do seletor de produto), preservando
// o histórico de pedidos que já a referenciam.
router.delete('/:variantId', async (req, res) => {
  const result = await query(
    'UPDATE product_variants SET active = FALSE WHERE id = $1 AND product_id = $2 RETURNING id',
    [req.params.variantId, req.params.productId]
  )
  if (result.rows.length === 0) throw notFound('Variação não encontrada')
  res.status(204).end()
})

export default router