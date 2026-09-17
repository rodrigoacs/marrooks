// Carrinho persistente em localStorage, sem dependência de Pinia/Vuex.
// Cada item é a combinação produto + variação (quando o produto tem
// variações) — a chave é productSlug + variantSlug, já que o mesmo produto
// pode estar no carrinho várias vezes com variações diferentes.

import { computed, reactive, watch } from 'vue'

const STORAGE_KEY = 'marrooks:cart'

function itemKey(productSlug, variantSlug) {
  return `${productSlug}::${variantSlug ?? ''}`
}

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

// `variant` é opcional — produtos sem variações (ex: Estante) entram direto.
function addItem(product, variant, quantity = 1) {
  const key = itemKey(product.slug, variant?.slug)
  const existing = state.items.find((item) => item.key === key)

  if (existing) {
    existing.quantity += quantity
    return
  }

  state.items.push({
    key,
    productSlug: product.slug,
    variantSlug: variant?.slug ?? null,
    name: variant ? `${product.name} — ${variant.name}` : product.name,
    variantName: variant?.name ?? null,
    author: variant?.author ?? null,
    series: variant?.series ?? null,
    price: product.price,
    image: variant?.image?.url ?? product.images?.[0]?.url ?? null,
    quantity,
  })
}

function removeItem(key) {
  const index = state.items.findIndex((item) => item.key === key)
  if (index !== -1) state.items.splice(index, 1)
}

function updateQuantity(key, quantity) {
  const item = state.items.find((item) => item.key === key)
  if (!item) return

  if (quantity <= 0) {
    removeItem(key)
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