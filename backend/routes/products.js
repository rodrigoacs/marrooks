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
    featured: row.featured,
    variantKind: row.variant_kind,
    category: row.category_slug ? { slug: row.category_slug, name: row.category_name } : null,
    dimensions: {
      width: row.width,
      height: row.height,
      length: row.length,
      weight: row.weight,
    },
    images: row.images ?? [],
    soldCount: Number(row.sold_count ?? 0),
    bestSeller: row.best_seller === true,
  }
}

function mapVariant(row) {
  return {
    slug: row.slug,
    name: row.name,
    series: row.series,
    author: row.author,
    image: row.image_url ? { url: row.image_url, alt: row.image_alt } : null,
  }
}

const BASE_SELECT = `
  WITH sales AS (
    SELECT oi.product_id, SUM(oi.quantity) AS sold_count
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status IN ('paid', 'preparing', 'shipped', 'delivered')
    GROUP BY oi.product_id
  ),
  ranked_sales AS (
    SELECT product_id, RANK() OVER (ORDER BY sold_count DESC) AS rnk
    FROM sales
  )
  SELECT
    p.id, p.slug, p.name, p.short_description, p.description,
    p.price, p.compare_price, p.featured, p.variant_kind,
    p.width, p.height, p.length, p.weight, p.created_at,
    c.slug AS category_slug, c.name AS category_name,
    COALESCE(s.sold_count, 0) AS sold_count,
    COALESCE(rs.rnk <= 3, FALSE) AS best_seller,
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
  LEFT JOIN sales s ON s.product_id = p.id
  LEFT JOIN ranked_sales rs ON rs.product_id = p.id
`

const SORT_OPTIONS = {
  relevance: 'p.featured DESC, p.name ASC',
  price_asc: 'p.price ASC, p.name ASC',
  price_desc: 'p.price DESC, p.name ASC',
  name_asc: 'p.name ASC',
  newest: 'p.created_at DESC',
  best_selling: 'sold_count DESC, p.name ASC',
}

// GET /api/products?category=livros&search=harry+potter&featured=true
router.get('/', async (req, res) => {
  const { category, search, featured, sort } = req.query

  const conditions = ['p.active = TRUE']
  const params = []

  if (category) {
    params.push(category)
    conditions.push(`c.slug = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    const term = `$${params.length}`
    conditions.push(`(
      p.name ILIKE ${term} OR p.description ILIKE ${term}
      OR EXISTS (
        SELECT 1 FROM product_variants v
        WHERE v.product_id = p.id AND v.active = TRUE
          AND (v.series ILIKE ${term} OR v.name ILIKE ${term} OR v.author ILIKE ${term})
      )
    )`)
  }

  if (featured === 'true') {
    conditions.push('p.featured = TRUE')
  }

  const orderBy = SORT_OPTIONS[sort] ?? SORT_OPTIONS.relevance

  const result = await query(
    `${BASE_SELECT} WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`,
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

  const product = result.rows[0]

  const variantsResult = await query(
    `SELECT slug, name, series, author, image_url, image_alt
     FROM product_variants
     WHERE product_id = $1 AND active = TRUE
     ORDER BY series NULLS LAST, name`,
    [product.id]
  )

  res.json({
    product: {
      ...mapProduct(product),
      variants: variantsResult.rows.map(mapVariant),
    },
  })
})

export default router