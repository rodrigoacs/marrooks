// Carrinho persistente em localStorage, sem dependência de Pinia/Vuex.
// Guarda snapshot do produto no momento em que foi adicionado (nome, preço,
// imagem), então o carrinho continua exibindo corretamente mesmo se o
// produto mudar de preço ou for removido do catálogo depois.

import { computed, reactive, watch } from 'vue'

const STORAGE_KEY = 'marrooks:cart'

function loadInitialItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const state = reactive({
  items: loadInitialItems(),
})

watch(
  () => state.items,
  (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // localStorage indisponível (modo privado, quota etc.) — carrinho
      // segue funcionando só em memória para a sessão atual.
    }
  },
  { deep: true }
)

function addItem(product, quantity = 1) {
  const existing = state.items.find((item) => item.slug === product.slug)

  if (existing) {
    existing.quantity += quantity
    return
  }

  state.items.push({
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images?.[0]?.url ?? null,
    quantity,
  })
}

function removeItem(slug) {
  const index = state.items.findIndex((item) => item.slug === slug)
  if (index !== -1) state.items.splice(index, 1)
}

function updateQuantity(slug, quantity) {
  const item = state.items.find((item) => item.slug === slug)
  if (!item) return

  if (quantity <= 0) {
    removeItem(slug)
    return
  }

  item.quantity = quantity
}

function clear() {
  state.items = []
}

export function useCart() {
  return {
    items: computed(() => state.items),
    itemCount: computed(() => state.items.reduce((sum, item) => sum + item.quantity, 0)),
    subtotal: computed(() => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)),
    addItem,
    removeItem,
    updateQuantity,
    clear,
  }
}