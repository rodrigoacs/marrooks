import { pool, query } from './index.js'

const categories = [
  { slug: 'mini-livros', name: 'Mini livros', description: 'Livrinhos 3D que cabem na palma da mão.', position: 1 },
  { slug: 'papelaria', name: 'Papelaria', description: 'Adesivos, marcadores e acessórios.', position: 2 },
  { slug: 'kits', name: 'Kits', description: 'Combinações preparadas com carinho.', position: 3 },
]

const products = [
  {
    slug: 'a-court-of-thorns-and-roses',
    name: 'A Court of Thorns and Roses',
    categorySlug: 'mini-livros',
    shortDescription: 'Mini livro 3D com capa ilustrada.',
    description:
      'Réplica em miniatura com capa ilustrada e páginas internas impressas. Perfeito para prateleiras, estantes de leitura e presentes.',
    price: 3.9,
    stock: 20,
    featured: true,
    width: 4.5,
    height: 1.5,
    length: 6,
    weight: 0.02,
    images: [{ url: '/produtos/acotar.jpg', alt: 'Mini livro A Court of Thorns and Roses' }],
  },
  {
    slug: 'game-of-thrones',
    name: 'Game of Thrones',
    categorySlug: 'mini-livros',
    shortDescription: 'Mini livro 3D com capa ilustrada.',
    description:
      'Miniatura do clássico, com acabamento em lombada e capa impressa em alta resolução.',
    price: 3.9,
    stock: 15,
    featured: true,
    width: 4.5,
    height: 1.5,
    length: 6,
    weight: 0.02,
    images: [{ url: '/produtos/got.jpg', alt: 'Mini livro Game of Thrones' }],
  },
  {
    slug: 'kindle-card-skin-rosa',
    name: 'Kindle Card Skin — Rosa',
    categorySlug: 'papelaria',
    shortDescription: 'Skin adesiva para cartão de leitura.',
    description:
      'Adesivo em vinil com acabamento fosco, fácil de aplicar e remover sem deixar resíduo.',
    price: 12,
    stock: 30,
    featured: false,
    width: 9,
    height: 0.2,
    length: 6,
    weight: 0.01,
    images: [{ url: '/produtos/kindle-card-rosa.jpg', alt: 'Kindle Card Skin rosa' }],
  },
]

async function seed() {
  const categoryIds = new Map()

  for (const category of categories) {
    const result = await query(
      `INSERT INTO categories (slug, name, description, position)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             description = EXCLUDED.description,
             position = EXCLUDED.position
       RETURNING id`,
      [category.slug, category.name, category.description, category.position]
    )
    categoryIds.set(category.slug, result.rows[0].id)
  }

  for (const product of products) {
    const result = await query(
      `INSERT INTO products
         (slug, name, short_description, description, price, stock, featured,
          category_id, width, height, length, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             short_description = EXCLUDED.short_description,
             description = EXCLUDED.description,
             price = EXCLUDED.price,
             stock = EXCLUDED.stock,
             featured = EXCLUDED.featured,
             category_id = EXCLUDED.category_id,
             width = EXCLUDED.width,
             height = EXCLUDED.height,
             length = EXCLUDED.length,
             weight = EXCLUDED.weight
       RETURNING id`,
      [
        product.slug,
        product.name,
        product.shortDescription,
        product.description,
        product.price,
        product.stock,
        product.featured,
        categoryIds.get(product.categorySlug),
        product.width,
        product.height,
        product.length,
        product.weight,
      ]
    )

    const productId = result.rows[0].id

    await query('DELETE FROM product_images WHERE product_id = $1', [productId])

    for (const [index, image] of product.images.entries()) {
      await query(
        `INSERT INTO product_images (product_id, url, alt, position)
         VALUES ($1, $2, $3, $4)`,
        [productId, image.url, image.alt, index]
      )
    }
  }

  console.log(`✅ Seed concluído: ${categories.length} categorias, ${products.length} produtos.`)
}

seed()
  .catch((error) => {
    console.error('❌ Erro ao rodar o seed:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())