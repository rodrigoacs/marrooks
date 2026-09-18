import express from 'express'

import { HttpError, badRequest } from '../../lib/errors.js'

const router = express.Router()

const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes'

function buildQuery(title, author) {
  let q = `intitle:${title}`
  if (author) q += `+inauthor:${author}`
  return q
}

function mapVolume(item) {
  const info = item.volumeInfo ?? {}
  return {
    title: info.title ?? null,
    authors: info.authors ?? [],
    pageCount: info.pageCount ?? null,
    publishedDate: info.publishedDate ?? null,
    publisher: info.publisher ?? null,
    thumbnail: info.imageLinks?.thumbnail ?? null,
  }
}

// GET /api/admin/book-lookup?title=...&author=...
router.get('/', async (req, res) => {
  const title = req.query.title?.trim()
  const author = req.query.author?.trim()

  if (!title) throw badRequest('Informe o título do livro')

  const url = new URL(GOOGLE_BOOKS_ENDPOINT)
  url.searchParams.set('q', buildQuery(title, author))
  url.searchParams.set('maxResults', '5')
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set('key', process.env.GOOGLE_BOOKS_API_KEY)
  }

  let response
  try {
    response = await fetch(url)
  } catch (error) {
    console.error('Erro ao conectar na Google Books API:', error)
    throw new HttpError(502, 'Não foi possível consultar o Google Books agora')
  }

  if (response.status === 429) {
    const body = await response.text().catch(() => '')
    console.error('Google Books API — cota excedida:', body)
    throw new HttpError(
      502,
      process.env.GOOGLE_BOOKS_API_KEY
        ? 'Cota diária do Google Books esgotada — tente novamente amanhã'
        : 'Google Books exige uma API key configurada no servidor (GOOGLE_BOOKS_API_KEY) — sem ela a cota é zero'
    )
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('Google Books API respondeu com erro:', response.status, body)
    throw new HttpError(502, 'Não foi possível consultar o Google Books agora')
  }

  const data = await response.json()
  const results = (data.items ?? [])
    .map(mapVolume)
    .filter((volume) => volume.pageCount)

  res.json({ results })
})

export default router