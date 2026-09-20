import { computed, reactive, watch } from 'vue'

const STORAGE_KEY = 'marrooks:wishlist'

function sanitizeItems(rawItems) {
  const seenSlugs = new Set()
  const sanitized = []

  for (const item of rawItems) {
    if (!item || typeof item !== 'object' || !item.slug) continue
    if (seenSlugs.has(item.slug)) continue
    seenSlugs.add(item.slug)
    sanitized.push(item)
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

function isWishlisted(slug) {
  return state.items.some((item) => item.slug === slug)
}

function toggleWishlist(product) {
  const index = state.items.findIndex((item) => item.slug === product.slug)

  if (index !== -1) {
    state.items.splice(index, 1)
    return
  }

  state.items.push({
    slug: product.slug,
    name: product.name,
    price: product.price,
    comparePrice: product.comparePrice ?? null,
    images: product.images?.[0] ? [product.images[0]] : [],
    category: product.category ?? null,
  })
}

function removeFromWishlist(slug) {
  const index = state.items.findIndex((item) => item.slug === slug)
  if (index !== -1) state.items.splice(index, 1)
}

export function useWishlist() {
  return {
    items: computed(() => state.items),
    wishlistCount: computed(() => state.items.length),
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
  }
}