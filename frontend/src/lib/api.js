// Cliente HTTP simples para o backend Marrooks.
// Sem dependências externas — usa fetch nativo, cookie httpOnly (credentials: 'include')
// e lança um erro com a mensagem vinda da API para o chamador tratar.

const BASE_URL = '/api'

class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    throw new ApiError(data?.error ?? 'Erro inesperado ao falar com o servidor', response.status, data?.details)
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateMe: (payload) => api.patch('/auth/me', payload),
  changePassword: (payload) => api.post('/auth/change-password', payload),
}

function toQueryString(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const productsApi = {
  list: (filters) => api.get(`/products${toQueryString(filters)}`),
  get: (slug) => api.get(`/products/${slug}`),
}

export const categoriesApi = {
  list: () => api.get('/categories'),
}

export const shippingApi = {
  calculate: (payload) => api.post('/shipping/calculate', payload),
}

export const ordersApi = {
  create: (payload) => api.post('/orders', payload),
  get: (reference) => api.get(`/orders/${reference}`),
}

export const paymentApi = {
  publicKey: () => api.get('/payment/public_key'),
  process: (payload) => api.post('/payment/process_payment', payload),
}

export const adminProductsApi = {
  list: () => api.get('/admin/products'),
  get: (id) => api.get(`/admin/products/${id}`),
  create: (payload) => api.post('/admin/products', payload),
  update: (id, payload) => api.patch(`/admin/products/${id}`, payload),
  remove: (id) => api.delete(`/admin/products/${id}`),
}

export const adminOrdersApi = {
  list: (filters) => api.get(`/admin/orders${toQueryString(filters)}`),
  get: (reference) => api.get(`/admin/orders/${reference}`),
  update: (reference, payload) => api.patch(`/admin/orders/${reference}`, payload),
}

export { ApiError }