import express from 'express'

import { query } from '../db/index.js'

const router = express.Router()

// GET /api/categories
router.get('/', async (req, res) => {
  const result = await query(
    `SELECT
       c.slug, c.name, c.description,
       COUNT(p.id) FILTER (WHERE p.active) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.position ASC, c.name ASC`
  )

  res.json({
    categories: result.rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      description: row.description,
      productCount: Number(row.product_count),
    })),
  })
})

export default router