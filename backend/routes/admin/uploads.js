import express from 'express'

import { badRequest } from '../../lib/errors.js'
import { requireAdmin } from '../../middleware/auth.js'
import { uploadImage } from '../../middleware/upload.js'

const router = express.Router()

router.use(requireAdmin)

// POST /api/admin/uploads — multipart/form-data, campo "image"
router.post('/', uploadImage.single('image'), (req, res) => {
  if (!req.file) throw badRequest('Envie um arquivo de imagem')

  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
  })
})

export default router