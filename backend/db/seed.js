import { pool, query } from './index.js'

const categories = [
  { slug: 'livros', name: 'Livros', description: 'Mini livros e kits com estante.', position: 1 },
  { slug: 'acessorios', name: 'Acessórios', description: 'Chaveiros, skins e outros itens de papelaria.', position: 2 },
]

// Catálogo completo de capas — cada produto tem seu próprio conjunto
// (linhas independentes no banco), mas Mini Livro e Chaveiro de Mini Livro
// hoje compartilham a mesma lista de livros disponíveis.
const allBookCapas = [
  // Corte de Espinhos e Rosas — Sarah J. Maas
  { series: 'Corte de Espinhos e Rosas', bookTitle: 'Corte de Espinhos e Rosas', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', bookTitle: 'Corte de Névoa e Fúria', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', bookTitle: 'Corte de Asas e Ruína', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', bookTitle: 'Corte de Gelo e Estrelas', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', bookTitle: 'Corte de Chamas Prateadas', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', bookTitle: 'Corte de Harmonias Partidas', author: 'Sarah J. Maas' },
  { series: 'Corte de Espinhos e Rosas', bookTitle: 'A Court of Forgotten Melody', author: 'Sarah J. Maas' },

  // Trono de Vidro — Sarah J. Maas
  { series: 'Trono de Vidro', bookTitle: 'Trono de Vidro', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', bookTitle: 'Coroa da Meia-Noite', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', bookTitle: 'Herdeira do Fogo', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', bookTitle: 'Rainha das Sombras', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', bookTitle: 'Império de Tempestades', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', bookTitle: 'Torre do Alvorecer', author: 'Sarah J. Maas' },
  { series: 'Trono de Vidro', bookTitle: 'Reino de Cinzas', author: 'Sarah J. Maas' },

  // Cidade da Lua Crescente — Sarah J. Maas
  { series: 'Cidade da Lua Crescente', bookTitle: 'Casa de Terra e Sangue', author: 'Sarah J. Maas' },
  { series: 'Cidade da Lua Crescente', bookTitle: 'Casa de Céu e Sopro', author: 'Sarah J. Maas' },
  { series: 'Cidade da Lua Crescente', bookTitle: 'Casa de Chama e Sombra', author: 'Sarah J. Maas' },

  // The Empyrean — Rebecca Yarros
  { series: 'The Empyrean', bookTitle: 'Quarta Asa', author: 'Rebecca Yarros' },
  { series: 'The Empyrean', bookTitle: 'Chama de Ferro', author: 'Rebecca Yarros' },
  { series: 'The Empyrean', bookTitle: 'Tempestade de Ônix', author: 'Rebecca Yarros' },

  // Percy Jackson e os Olimpianos — Rick Riordan
  { series: 'Percy Jackson e os Olimpianos', bookTitle: 'O Ladrão de Raios', author: 'Rick Riordan' },
  { series: 'Percy Jackson e os Olimpianos', bookTitle: 'O Mar de Monstros', author: 'Rick Riordan' },
  { series: 'Percy Jackson e os Olimpianos', bookTitle: 'A Maldição do Titã', author: 'Rick Riordan' },
  { series: 'Percy Jackson e os Olimpianos', bookTitle: 'A Batalha do Labirinto', author: 'Rick Riordan' },
  { series: 'Percy Jackson e os Olimpianos', bookTitle: 'O Último Olimpiano', author: 'Rick Riordan' },

  // Harry Potter — J.K. Rowling
  { series: 'Harry Potter', bookTitle: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling' },
  { series: 'Harry Potter', bookTitle: 'Harry Potter e a Câmara Secreta', author: 'J.K. Rowling' },
  { series: 'Harry Potter', bookTitle: 'Harry Potter e o Prisioneiro de Azkaban', author: 'J.K. Rowling' },
  { series: 'Harry Potter', bookTitle: 'Harry Potter e o Cálice de Fogo', author: 'J.K. Rowling' },
  { series: 'Harry Potter', bookTitle: 'Harry Potter e a Ordem da Fênix', author: 'J.K. Rowling' },
  { series: 'Harry Potter', bookTitle: 'Harry Potter e o Enigma do Príncipe', author: 'J.K. Rowling' },
  { series: 'Harry Potter', bookTitle: 'Harry Potter e as Relíquias da Morte', author: 'J.K. Rowling' },

  // Alchemised — standalone
  { series: null, bookTitle: 'Alchemised', author: 'SenLinYu' },

  // Off-Campus — Elle Kennedy
  { series: 'Off-Campus', bookTitle: 'O Acordo', author: 'Elle Kennedy' },
  { series: 'Off-Campus', bookTitle: 'O Erro', author: 'Elle Kennedy' },
  { series: 'Off-Campus', bookTitle: 'O Jogo', author: 'Elle Kennedy' },
  { series: 'Off-Campus', bookTitle: 'A Conquista', author: 'Elle Kennedy' },
  { series: 'Off-Campus', bookTitle: 'The Legacy', author: 'Elle Kennedy' },

  // Adeline — H. D. Carlton
  { series: 'Adeline', bookTitle: 'Assombrando Adeline', author: 'H. D. Carlton' },
  { series: 'Adeline', bookTitle: 'Perseguindo Adeline', author: 'H. D. Carlton' },

  // Devil's Night — Penelope Douglas
  { series: "Devil's Night", bookTitle: 'Corrupt', author: 'Penelope Douglas' },
  { series: "Devil's Night", bookTitle: 'Hideaway', author: 'Penelope Douglas' },
  { series: "Devil's Night", bookTitle: 'Kill Switch', author: 'Penelope Douglas' },
  { series: "Devil's Night", bookTitle: 'Nightfall', author: 'Penelope Douglas' },

  // Rostos Vazios — Leonor Carvalho
  { series: 'Rostos Vazios', bookTitle: 'Incipit', author: 'Leonor Carvalho' },
  { series: 'Rostos Vazios', bookTitle: 'Oblívio', author: 'Leonor Carvalho' },
  { series: 'Rostos Vazios', bookTitle: 'Exímio', author: 'Leonor Carvalho' },
]

// Amostra menor pro Kit (mini livro + estante) — ainda não pedida em
// catálogo completo, mantém só alguns exemplos de cada série.
const kitCapasAmostra = allBookCapas.slice(0, 4)

const products = [
  {
    slug: 'mini-livro',
    name: 'Mini Livro',
    categorySlug: 'livros',
    shortDescription: 'Mini livro 3D com capa ilustrada.',
    description:
      'Réplica em miniatura com capa ilustrada e páginas internas impressas. Escolha a capa do seu livro favorito.',
    price: 3.9,
    featured: true,
    width: 4.5,
    height: 1.5,
    length: 6,
    weight: 0.02,
    images: [{ url: '/produtos/mini-livro.jpg', alt: 'Mini livro Marrooks' }],
    variants: allBookCapas,
  },
  {
    slug: 'mini-livro-estante-kit',
    name: 'Mini Livro + Estante (Kit)',
    categorySlug: 'livros',
    shortDescription: 'O mini livro acompanhado da estante para exibir.',
    description: 'Kit com o mini livro da capa escolhida mais uma estante para exibir sua coleção.',
    price: 12.9,
    featured: true,
    width: 12,
    height: 6,
    length: 8,
    weight: 0.08,
    images: [{ url: '/produtos/kit.jpg', alt: 'Kit mini livro com estante' }],
    variants: kitCapasAmostra,
  },
  {
    slug: 'estante',
    name: 'Estante',
    categorySlug: 'livros',
    shortDescription: 'Estante para exibir sua coleção de mini livros.',
    description: 'Estante impressa em 3D, pensada para organizar e exibir os mini livros Marrooks.',
    price: 9.9,
    featured: false,
    width: 12,
    height: 6,
    length: 8,
    weight: 0.06,
    images: [{ url: '/produtos/estante.jpg', alt: 'Estante para mini livros' }],
    variants: [],
  },
  {
    slug: 'chaveiro-mini-livro',
    name: 'Chaveiro de Mini Livro',
    categorySlug: 'acessorios',
    shortDescription: 'Leve seu livro favorito no chaveiro.',
    description: 'Mini livro em formato de chaveiro, com a mesma capa ilustrada dos livros da coleção.',
    price: 6.9,
    featured: false,
    width: 4,
    height: 1.5,
    length: 5,
    weight: 0.015,
    images: [{ url: '/produtos/chaveiro.jpg', alt: 'Chaveiro de mini livro' }],
    variants: allBookCapas,
  },
  {
    slug: 'kindle-card-skin',
    name: 'Card Skin Kindle',
    categorySlug: 'acessorios',
    shortDescription: 'Skin adesiva para cartão de leitura.',
    description: 'Adesivo em vinil com acabamento fosco, fácil de aplicar e remover sem deixar resíduo.',
    price: 12,
    featured: false,
    width: 9,
    height: 0.2,
    length: 6,
    weight: 0.01,
    images: [{ url: '/produtos/kindle-card-rosa.jpg', alt: 'Kindle Card Skin' }],
    variants: [],
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
         (slug, name, short_description, description, price, featured,
          category_id, width, height, length, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             short_description = EXCLUDED.short_description,
             description = EXCLUDED.description,
             price = EXCLUDED.price,
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

    await query('DELETE FROM product_variants WHERE product_id = $1', [productId])
    for (const [index, variant] of product.variants.entries()) {
      const slug = variant.bookTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      await query(
        `INSERT INTO product_variants (product_id, slug, series, book_title, author, position)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [productId, slug, variant.series, variant.bookTitle, variant.author, index]
      )
    }
  }

  const variantCount = products.reduce((sum, product) => sum + product.variants.length, 0)
  console.log(
    `✅ Seed concluído: ${categories.length} categorias, ${products.length} produtos, ${variantCount} capas.`
  )
}

seed()
  .catch((error) => {
    console.error('❌ Erro ao rodar o seed:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())