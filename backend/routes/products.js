import express from 'express'

import { query } from '../db/index.js'
import { notFound } from '../lib/errors.js'

const router = express.Router()

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
    featured: row.featured,
    category: row.category_slug ? { slug: row.category_slug, name: row.category_name } : null,
    dimensions: {
      width: row.width,
      height: row.height,
      length: row.length,
      weight: row.weight,
    },
    images: row.images ?? [],
  }
}

const BASE_SELECT = `
  SELECT
    p.id, p.slug, p.name, p.short_description, p.description,
    p.price, p.compare_price, p.stock, p.featured,
    p.width, p.height, p.length, p.weight,
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

// GET /api/products?category=mini-livros&search=thorns&featured=true
router.get('/', async (req, res) => {
  const { category, search, featured } = req.query

  const conditions = ['p.active = TRUE']
  const params = []

  if (category) {
    params.push(category)
    conditions.push(`c.slug = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`)
  }

  if (featured === 'true') {
    conditions.push('p.featured = TRUE')
  }

  const result = await query(
    `${BASE_SELECT} WHERE ${conditions.join(' AND ')} ORDER BY p.featured DESC, p.name ASC`,
    params
  )

  res.json({ products: result.rows.map(mapProduct) })
})

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  const result = await query(`${BASE_SELECT} WHERE p.slug = $1 AND p.active = TRUE`, [
    req.params.slug,
  ])

  if (result.rows.length === 0) throw notFound('Produto não encontrado')

  res.json({ product: mapProduct(result.rows[0]) })
})

export default router