import { pool, query } from './index.js'

const categories = [
  { slug: 'livros', name: 'Livros', description: 'Mini livros e kits com estante.', position: 1 },
  { slug: 'acessorios', name: 'Acessórios', description: 'Chaveiros, skins e outros itens de papelaria.', position: 2 },
]

const allBookVariants = [
  // Corte de Espinhos e Rosas — Sarah J. Maas
  { series: 'Corte de Espinhos e Rosas', name: 'Corte de Espinhos e Rosas', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', name: 'Corte de Névoa e Fúria', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', name: 'Corte de Asas e Ruína', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', name: 'Corte de Gelo e Estrelas', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', name: 'Corte de Chamas Prateadas', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', name: 'Corte de Harmonias Partidas', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', name: 'A Court of Forgotten Melody', author: 'Sarah J. Maas' },

  // Trono de Vidro — Sarah J. Maas
  { series: 'Trono de Vidro', name: 'Trono de Vidro', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', name: 'Coroa da Meia-Noite', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', name: 'Herdeira do Fogo', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', name: 'Rainha das Sombras', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', name: 'Império de Tempestades', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', name: 'Torre do Alvorecer', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', name: 'Reino de Cinzas', author: 'Sarah J. Maas' },

  // Cidade da Lua Crescente — Sarah J. Maas
  { series: 'Cidade da Lua Crescente', name: 'Casa de Terra e Sangue', author: 'Sarah J. Maas' },
  { series: 'Cidade da Lua Crescente', name: 'Casa de Céu e Sopro', author: 'Sarah J. Maas' },
  { series: 'Cidade da Lua Crescente', name: 'Casa de Chama e Sombra', author: 'Sarah J. Maas' },

  // The Empyrean — Rebecca Yarros
  { series: 'The Empyrean', name: 'Quarta Asa', author: 'Rebecca Yarros' },
  { series: 'The Empyrean', name: 'Chama de Ferro', author: 'Rebecca Yarros' },
  { series: 'The Empyrean', name: 'Tempestade de Ônix', author: 'Rebecca Yarros' },

  // Percy Jackson e os Olimpianos — Rick Riordan
  { series: 'Percy Jackson e os Olimpianos', name: 'O Ladrão de Raios', author: 'Rick Riordan' },
  { series: 'Percy Jackson e os Olimpianos', name: 'O Mar de Monstros', author: 'Rick Riordan' },
  { series: 'Percy Jackson e os Olimpianos', name: 'A Maldição do Titã', author: 'Rick Riordan' },
  { series: 'Percy Jackson e os Olimpianos', name: 'A Batalha do Labirinto', author: 'Rick Riordan' },
  { series: 'Percy Jackson e os Olimpianos', name: 'O Último Olimpiano', author: 'Rick Riordan' },

  // Harry Potter — J.K. Rowling
  { series: 'Harry Potter', name: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling' },
  { series: 'Harry Potter', name: 'Harry Potter e a Câmara Secreta', author: 'J.K. Rowling' },
  { series: 'Harry Potter', name: 'Harry Potter e o Prisioneiro de Azkaban', author: 'J.K. Rowling' },
  { series: 'Harry Potter', name: 'Harry Potter e o Cálice de Fogo', author: 'J.K. Rowling' },
  { series: 'Harry Potter', name: 'Harry Potter e a Ordem da Fênix', author: 'J.K. Rowling' },
  { series: 'Harry Potter', name: 'Harry Potter e o Enigma do Príncipe', author: 'J.K. Rowling' },
  { series: 'Harry Potter', name: 'Harry Potter e as Relíquias da Morte', author: 'J.K. Rowling' },

  // Alchemised — standalone
  { series: null, name: 'Alchemised', author: 'SenLinYu' },

  // Off-Campus — Elle Kennedy
  { series: 'Off-Campus', name: 'O Acordo', author: 'Elle Kennedy' },
  { series: 'Off-Campus', name: 'O Erro', author: 'Elle Kennedy' },
  { series: 'Off-Campus', name: 'O Jogo', author: 'Elle Kennedy' },
  { series: 'Off-Campus', name: 'A Conquista', author: 'Elle Kennedy' },
  { series: 'Off-Campus', name: 'The Legacy', author: 'Elle Kennedy' },

  // Adeline — H. D. Carlton
  { series: 'Adeline', name: 'Assombrando Adeline', author: 'H. D. Carlton' },
  { series: 'Adeline', name: 'Perseguindo Adeline', author: 'H. D. Carlton' },

  // Devil's Night — Penelope Douglas
  { series: "Devil's Night", name: 'Corrupt', author: 'Penelope Douglas' },
  { series: "Devil's Night", name: 'Hideaway', author: 'Penelope Douglas' },
  { series: "Devil's Night", name: 'Kill Switch', author: 'Penelope Douglas' },
  { series: "Devil's Night", name: 'Nightfall', author: 'Penelope Douglas' },

  // Rostos Vazios — Leonor Carvalho
  { series: 'Rostos Vazios', name: 'Incipit', author: 'Leonor Carvalho' },
  { series: 'Rostos Vazios', name: 'Oblívio', author: 'Leonor Carvalho' },
  { series: 'Rostos Vazios', name: 'Exímio', author: 'Leonor Carvalho' },
]

const products = [
  {
    slug: 'mini-livro',
    name: 'Mini Livro',
    categorySlug: 'livros',
    shortDescription: 'Mini livro 3D com capa ilustrada.',
    description:
      'Réplica em miniatura com capa ilustrada e páginas internas impressas. Escolha a variação do seu livro favorito.',
    price: 3.9,
    featured: true,
    variantKind: 'book',
    width: 4.5,
    height: 1.5,
    length: 6,
    weight: 0.02,
    images: [{ url: '/produtos/mini-livro.jpg', alt: 'Mini livro Marrooks' }],
    variants: allBookVariants,
  },
  {
    slug: 'chaveiro-livro',
    name: 'Chaveiro Livro',
    categorySlug: 'acessorios',
    shortDescription: 'Leve seu livro favorito no chaveiro.',
    description: 'Mini livro em formato de chaveiro, com a mesma capa ilustrada dos livros da coleção.',
    price: 6.9,
    featured: false,
    variantKind: 'book',
    width: 4,
    height: 1.5,
    length: 5,
    weight: 0.015,
    images: [{ url: '/produtos/chaveiro.jpg', alt: 'Chaveiro Livro' }],
    variants: allBookVariants,
  },
  {
    slug: 'chaveiro-kindle',
    name: 'Chaveiro Kindle',
    categorySlug: 'acessorios',
    shortDescription: 'Chaveiro com a capa do seu livro favorito, no estilo mini-kindle.',
    description: 'Chaveiro em formato de leitor digital, com a mesma capa ilustrada dos livros da coleção.',
    price: 6.9,
    featured: false,
    variantKind: 'book',
    width: 4,
    height: 1.5,
    length: 5,
    weight: 0.015,
    images: [{ url: '/produtos/kindle-card-rosa.jpg', alt: 'Chaveiro Kindle' }],
    variants: allBookVariants,
  },
  {
    slug: 'estante',
    name: 'Estante',
    categorySlug: 'livros',
    shortDescription: 'Estante para exibir sua coleção de mini livros.',
    description: 'Estante impressa em 3D, pensada para organizar e exibir os mini livros Marrooks. Escolha o modelo.',
    price: 9.9,
    featured: false,
    variantKind: 'simple',
    width: 12,
    height: 6,
    length: 8,
    weight: 0.06,
    images: [{ url: '/produtos/estante.jpg', alt: 'Estante para mini livros' }],
    variants: [],
  },
]

const removedProductSlugs = ['mini-livro-estante-kit', 'kindle-card-skin', 'chaveiro-mini-livro']

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

  for (const slug of removedProductSlugs) {
    await query('DELETE FROM products WHERE slug = $1', [slug])
  }

  for (const product of products) {
    const result = await query(
      `INSERT INTO products
         (slug, name, short_description, description, price, featured,
          variant_kind, category_id, width, height, length, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             short_description = EXCLUDED.short_description,
             description = EXCLUDED.description,
             price = EXCLUDED.price,
             featured = EXCLUDED.featured,
             variant_kind = EXCLUDED.variant_kind,
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
        product.featured,
        product.variantKind,
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

    await query('DELETE FROM product_variants WHERE product_id = $1', [productId])
    for (const [index, variant] of product.variants.entries()) {
      const slug = variant.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      await query(
        `INSERT INTO product_variants (product_id, slug, series, name, author, position)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [productId, slug, variant.series ?? null, variant.name, variant.author ?? null, index]
      )
    }
  }

  const variantCount = products.reduce((sum, product) => sum + product.variants.length, 0)
  console.log(
    `✅ Seed concluído: ${categories.length} categorias, ${products.length} produtos, ${variantCount} variações.`
  )
}

seed()
  .catch((error) => {
    console.error('❌ Erro ao rodar o seed:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())