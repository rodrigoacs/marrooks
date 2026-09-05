import express from 'express'

import { query, transaction } from '../../db/index.js'
import { badRequest, notFound } from '../../lib/errors.js'
import { requireAdmin } from '../../middleware/auth.js'

const router = express.Router()

router.use(requireAdmin)

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    price: row.price,
    comparePrice: row.compare_price,
    stock: row.stock,
    active: row.active,
    featured: row.featured,
    category: row.category_slug ? { slug: row.category_slug, name: row.category_name } : null,
    categoryId: row.category_id,
    dimensions: {
      width: row.width,
      height: row.height,
      length: row.length,
      weight: row.weight,
    },
    images: row.images ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const BASE_SELECT = `
  SELECT
    p.id, p.slug, p.name, p.short_description, p.description,
    p.price, p.compare_price, p.stock, p.active, p.featured, p.category_id,
    p.width, p.height, p.length, p.weight, p.created_at, p.updated_at,
    c.slug AS category_slug, c.name AS category_name,
    COALESCE(
      (
        SELECT json_agg(json_build_object('url', i.url, 'alt', i.alt) ORDER BY i.position)
        FROM product_images i
        WHERE i.product_id = p.id
      ),
      '[]'::json
    ) AS images
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`

function validatePayload(body, { partial } = {}) {
  const errors = {}
  const data = {}

  if (!partial || body.name !== undefined) {
    data.name = body.name?.trim()
    if (!data.name || data.name.length < 2) errors.name = 'Informe o nome do produto'
  }

  if (!partial || body.slug !== undefined) {
    data.slug = body.slug?.trim().toLowerCase()
    if (!data.slug || !SLUG_PATTERN.test(data.slug)) {
      errors.slug = 'Slug inválido — use letras minúsculas, números e hífens'
    }
  }

  if (!partial || body.price !== undefined) {
    data.price = Number(body.price)
    if (!Number.isFinite(data.price) || data.price < 0) errors.price = 'Informe um preço válido'
  }

  if (body.comparePrice !== undefined) {
    data.comparePrice = body.comparePrice === null || body.comparePrice === '' ? null : Number(body.comparePrice)
    if (data.comparePrice !== null && (!Number.isFinite(data.comparePrice) || data.comparePrice < 0)) {
      errors.comparePrice = 'Preço comparativo inválido'
    }
  }

  if (!partial || body.stock !== undefined) {
    data.stock = Number(body.stock)
    if (!Number.isInteger(data.stock) || data.stock < 0) errors.stock = 'Informe um estoque válido'
  }

  if (body.categoryId !== undefined) {
    data.categoryId = body.categoryId === null || body.categoryId === '' ? null : Number(body.categoryId)
  }

  if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription?.trim() || null
  if (body.description !== undefined) data.description = body.description?.trim() || null
  if (body.active !== undefined) data.active = Boolean(body.active)
  if (body.featured !== undefined) data.featured = Boolean(body.featured)

  for (const key of ['width', 'height', 'length', 'weight']) {
    if (body[key] !== undefined) {
      const value = Number(body[key])
      if (!Number.isFinite(value) || value <= 0) {
        errors[key] = 'Dimensão inválida'
      } else {
        data[key] = value
      }
    }
  }

  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      errors.images = 'Imagens inválidas'
    } else {
      data.images = body.images
        .filter((image) => image?.url?.trim())
        .map((image) => ({ url: image.url.trim(), alt: image.alt?.trim() || null }))
    }
  }

  if (Object.keys(errors).length > 0) throw badRequest('Dados do produto inválidos', errors)

  return data
}

// GET /api/admin/products
router.get('/', async (req, res) => {
  const result = await query(`${BASE_SELECT} ORDER BY p.created_at DESC`)
  res.json({ products: result.rows.map(mapProduct) })
})

// GET /api/admin/products/:id
router.get('/:id', async (req, res) => {
  const result = await query(`${BASE_SELECT} WHERE p.id = $1`, [req.params.id])
  if (result.rows.length === 0) throw notFound('Produto não encontrado')
  res.json({ product: mapProduct(result.rows[0]) })
})

// POST /api/admin/products
router.post('/', async (req, res) => {
  const data = validatePayload(req.body ?? {})

  const product = await transaction(async (client) => {
    const result = await client.query(
      `INSERT INTO products
         (slug, name, short_description, description, price, compare_price, stock,
          active, featured, category_id, width, height, length, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [
        data.slug,
        data.name,
        data.shortDescription ?? null,
        data.description ?? null,
        data.price,
        data.comparePrice ?? null,
        data.stock,
        data.active ?? true,
        data.featured ?? false,
        data.categoryId ?? null,
        data.width ?? 11,
        data.height ?? 2,
        data.length ?? 16,
        data.weight ?? 0.05,
      ]
    )

    const productId = result.rows[0].id

    for (const [index, image] of (data.images ?? []).entries()) {
      await client.query(
        `INSERT INTO product_images (product_id, url, alt, position) VALUES ($1, $2, $3, $4)`,
        [productId, image.url, image.alt, index]
      )
    }

    return productId
  })

  const result = await query(`${BASE_SELECT} WHERE p.id = $1`, [product])
  res.status(201).json({ product: mapProduct(result.rows[0]) })
})

// PATCH /api/admin/products/:id
router.patch('/:id', async (req, res) => {
  const existing = await query('SELECT id FROM products WHERE id = $1', [req.params.id])
  if (existing.rows.length === 0) throw notFound('Produto não encontrado')

  const data = validatePayload(req.body ?? {}, { partial: true })

  const fieldMap = {
    slug: 'slug',
    name: 'name',
    shortDescription: 'short_description',
    description: 'description',
    price: 'price',
    comparePrice: 'compare_price',
    stock: 'stock',
    active: 'active',
    featured: 'featured',
    categoryId: 'category_id',
    width: 'width',
    height: 'height',
    length: 'length',
    weight: 'weight',
  }

  const sets = []
  const params = [req.params.id]

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      params.push(data[key])
      sets.push(`${column} = $${params.length}`)
    }
  }

  await transaction(async (client) => {
    if (sets.length > 0) {
      await client.query(`UPDATE products SET ${sets.join(', ')} WHERE id = $1`, params)
    }

    if (data.images !== undefined) {
      await client.query('DELETE FROM product_images WHERE product_id = $1', [req.params.id])
      for (const [index, image] of data.images.entries()) {
        await client.query(
          `INSERT INTO product_images (product_id, url, alt, position) VALUES ($1, $2, $3, $4)`,
          [req.params.id, image.url, image.alt, index]
        )
      }
    }
  })

  const result = await query(`${BASE_SELECT} WHERE p.id = $1`, [req.params.id])
  res.json({ product: mapProduct(result.rows[0]) })
})

// DELETE /api/admin/products/:id
// Soft delete: desativa o produto (some da vitrine) sem quebrar o histórico
// de pedidos que já referenciam esse product_id.
router.delete('/:id', async (req, res) => {
  const result = await query(
    'UPDATE products SET active = FALSE WHERE id = $1 RETURNING id',
    [req.params.id]
  )
  if (result.rows.length === 0) throw notFound('Produto não encontrado')
  res.status(204).end()
})

export default router