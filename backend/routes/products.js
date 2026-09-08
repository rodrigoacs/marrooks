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

function mapVariant(row) {
  return {
    slug: row.slug,
    series: row.series,
    bookTitle: row.book_title,
    author: row.author,
    image: row.image_url ? { url: row.image_url, alt: row.image_alt } : null,
  }
}

const BASE_SELECT = `
  SELECT
    p.id, p.slug, p.name, p.short_description, p.description,
    p.price, p.compare_price, p.featured,
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

// GET /api/products?category=livros&search=harry+potter&featured=true
// A busca também encontra produtos por uma capa correspondente (série,
// livro ou autor) — assim o cliente acha o "Mini Livro" procurando
// diretamente pelo título ou autor que quer, sem a capa virar um item
// separado no catálogo.
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
    const term = `$${params.length}`
    conditions.push(`(
      p.name ILIKE ${term} OR p.description ILIKE ${term}
      OR EXISTS (
        SELECT 1 FROM product_variants v
        WHERE v.product_id = p.id AND v.active = TRUE
          AND (v.series ILIKE ${term} OR v.book_title ILIKE ${term} OR v.author ILIKE ${term})
      )
    )`)
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

  const product = result.rows[0]

  const variantsResult = await query(
    `SELECT slug, series, book_title, author, image_url, image_alt
     FROM product_variants
     WHERE product_id = $1 AND active = TRUE
     ORDER BY series NULLS LAST, book_title`,
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