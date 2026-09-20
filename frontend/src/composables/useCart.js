import { computed, reactive, watch } from 'vue'

const STORAGE_KEY = 'marrooks:cart'

function itemKey(productSlug, variantSlug) {
  return `${productSlug}::${variantSlug ?? ''}`
}

function sanitizeItems(rawItems) {
  const seenKeys = new Set()
  const sanitized = []

  for (const item of rawItems) {
    if (!item || typeof item !== 'object' || !item.productSlug) continue

    const key = itemKey(item.productSlug, item.variantSlug)
    if (seenKeys.has(key)) continue
    seenKeys.add(key)

    sanitized.push({ ...item, key })
  }

  return sanitized
}

function loadInitialItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? sanitizeItems(parsed) : []
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
    }
  },
  { deep: true }
)

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