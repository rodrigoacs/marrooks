import cors from 'cors'
import express from 'express'
import { MulterError } from 'multer'

import { checkConnection } from './db/index.js'
import { cookieParser } from './lib/cookies.js'
import { HttpError, notFound } from './lib/errors.js'
import { authenticate, requireAdmin } from './middleware/auth.js'
import { UPLOADS_DIR } from './middleware/upload.js'
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/categories.js'
import orderRoutes from './routes/orders.js'
import paymentRoutes from './routes/payment.js'
import productRoutes from './routes/products.js'
import shippingRoutes from './routes/shipping.js'
import adminProductRoutes from './routes/admin/products.js'
import adminOrderRoutes from './routes/admin/orders.js'
import adminUploadRoutes from './routes/admin/uploads.js'
import adminBookLookupRoutes from './routes/admin/book-lookup.js'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? true,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser)
app.use(authenticate)
app.use('/uploads', express.static(UPLOADS_DIR))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/shipping', shippingRoutes)
app.use('/api/admin/products', adminProductRoutes)
app.use('/api/admin/orders', adminOrderRoutes)
app.use('/api/admin/uploads', adminUploadRoutes)
app.use('/api/admin/book-lookup', requireAdmin, adminBookLookupRoutes)

app.get('/', (req, res) => {
  res.json({ status: 'Marrooks API rodando 🚀' })
})

app.get('/api/health', async (req, res) => {
  const now = await checkConnection()
  res.json({ status: 'ok', database: 'ok', time: now })
})

app.use((req, res, next) => {
  next(notFound('Rota não encontrada'))
})

app.use((error, req, res, next) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    })
  }

  if (error instanceof MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE' ? 'Imagem muito grande (máximo 5MB)' : 'Não foi possível enviar a imagem'
    return res.status(400).json({ error: message })
  }

  // Violação de UNIQUE no PostgreSQL
  if (error?.code === '23505') {
    return res.status(409).json({ error: 'Já existe um registro com esses dados' })
  }

  // Violação de chave estrangeira
  if (error?.code === '23503') {
    return res.status(400).json({ error: 'Referência inválida' })
  }

  console.error('Erro não tratado:', error)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  try {
    await checkConnection()
    console.log('Conectado ao PostgreSQL.')
  } catch (error) {
    console.error('Não foi possível conectar ao PostgreSQL:', error.message)
  }
})