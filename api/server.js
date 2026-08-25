const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.json({ limit: '20mb' }))

const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'data.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { password: null, todos: [], notes: '' }
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// Público: diz apenas se já existe uma senha configurada
app.get('/api/status', (req, res) => {
  const data = readData()
  res.json({ hasPassword: !!data.password })
})

// Cria a senha na primeira vez (só funciona se ainda não houver senha)
app.post('/api/setup', (req, res) => {
  const { password } = req.body || {}
  if (!password || password.length < 3) {
    return res.status(400).json({ error: 'Senha muito curta.' })
  }
  const data = readData()
  if (data.password) {
    return res.status(400).json({ error: 'Senha já configurada.' })
  }
  data.password = password
  writeData(data)
  res.json({ ok: true })
})

// Confere a senha (usado na tela de login)
app.post('/api/check', (req, res) => {
  const { password } = req.body || {}
  const data = readData()
  res.json({ ok: !!data.password && data.password === password })
})

// Troca a senha (exige a senha atual)
app.post('/api/change-password', (req, res) => {
  const { password, newPassword } = req.body || {}
  const data = readData()
  if (data.password !== password) {
    return res.status(401).json({ error: 'Senha incorreta.' })
  }
  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: 'Nova senha muito curta.' })
  }
  data.password = newPassword
  writeData(data)
  res.json({ ok: true })
})

// Lê tarefas e anotações — exige a senha no header x-todo-password
app.get('/api/data', (req, res) => {
  const password = req.headers['x-todo-password']
  const data = readData()
  if (!data.password || data.password !== password) {
    return res.status(401).json({ error: 'Senha incorreta.' })
  }
  res.json({ todos: data.todos || [], notes: data.notes || '' })
})

// Salva tarefas e/ou anotações — exige a senha no header x-todo-password
app.put('/api/data', (req, res) => {
  const password = req.headers['x-todo-password']
  const data = readData()
  if (!data.password || data.password !== password) {
    return res.status(401).json({ error: 'Senha incorreta.' })
  }
  const { todos, notes } = req.body || {}
  if (todos !== undefined) data.todos = todos
  if (notes !== undefined) data.notes = notes
  writeData(data)
  res.json({ ok: true })
})

const PORT = process.env.PORT || 3344
app.listen(PORT, () => console.log(`Marrooks to-do API rodando na porta ${PORT}`))