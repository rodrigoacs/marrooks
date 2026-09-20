<template>
  <div
    v-if="loading"
    class="product"
    aria-hidden="true"
  >
    <div class="gallery">
      <div class="image-wrap shimmer" />
    </div>
    <div class="info">
      <div class="skeleton-line shimmer sk-category" />
      <div class="skeleton-line shimmer sk-title" />
      <div class="skeleton-line shimmer sk-price" />
      <div class="skeleton-line shimmer sk-text" />
      <div class="skeleton-line shimmer sk-text short" />
      <div class="skeleton-line shimmer sk-cta" />
    </div>
  </div>

  <p
    v-else-if="error"
    class="state error"
  >{{ error }}</p>

  <div
    v-else-if="product"
    class="product"
  >
    <div class="gallery">
      <div class="image-wrap">
        <Transition
          name="fade"
          mode="out-in"
        >
          <img
            v-if="displayImage"
            :key="displayImage"
            :src="displayImage"
            :alt="selectedVariant?.name ?? product.name"
          />
          <div
            v-else
            key="fallback"
            class="image-fallback"
          >{{ product.name.charAt(0) }}</div>
        </Transition>
      </div>

      <div
        v-if="showGalleryThumbs"
        class="thumbs"
      >
        <button
          v-for="(image, index) in product.images"
          :key="image.url"
          type="button"
          class="thumb"
          :class="{ selected: index === selectedImageIndex }"
          :aria-label="`Ver foto ${index + 1} de ${product.images.length}`"
          @click="selectedImageIndex = index"
        >
          <img
            :src="image.url"
            :alt="image.alt ?? product.name"
          />
        </button>
      </div>
    </div>

    <div class="info">
      <p
        v-if="product.category"
        class="category"
      >{{ product.category.name }}</p>
      <h1>{{ product.name }}</h1>
      <p class="price">{{ formatPrice(product.price) }}</p>

      <p
        v-if="product.shortDescription"
        class="short-description"
      >{{ product.shortDescription }}</p>

      <p
        v-if="product.description"
        class="description"
      >{{ product.description }}</p>

      <div
        v-if="product.variants.length > 0"
        class="variant-picker"
      >
        <p class="section-label">Escolha a variação</p>
        <input
          v-model="search"
          type="search"
          :placeholder="isBookProduct ? 'Buscar por livro, série ou autor...' : 'Buscar variação...'"
          class="search"
        />

        <Transition name="fade">
          <p
            v-if="selectedVariant"
            class="selected-variant"
          >
            Selecionado: <strong>{{ selectedVariant.name }}</strong>
            <template v-if="selectedVariant.author"> — {{ selectedVariant.author }}</template>
          </p>
        </Transition>

        <TransitionGroup
          name="variant"
          tag="div"
          class="variant-list"
        >
          <button
            v-for="variant in filteredVariants"
            :key="variant.slug"
            type="button"
            class="variant-option"
            :class="{ selected: selectedVariant?.slug === variant.slug }"
            @click="selectedVariant = variant"
          >
            <img
              v-if="variant.image?.url"
              :src="variant.image.url"
              :alt="variant.name"
            />
            <div
              v-else
              class="variant-image-fallback"
            >{{ variant.name.charAt(0) }}</div>
            <span class="variant-info">
              <span class="variant-title">{{ variant.name }}</span>
              <span
                v-if="variant.author || variant.series"
                class="variant-meta"
              >
                {{ variant.author }}<template v-if="variant.author && variant.series"> · </template>{{ variant.series }}
              </span>
            </span>
          </button>

          <p
            v-if="filteredVariants.length === 0"
            key="no-results"
            class="no-results"
          >Nenhuma variação encontrada.</p>
        </TransitionGroup>
      </div>

      <div class="add-to-cart">
        <div class="qty-row">
          <button
            type="button"
            @click="quantity = Math.max(1, quantity - 1)"
          >-</button>
          <span>{{ quantity }}</span>
          <button
            type="button"
            @click="quantity++"
          >+</button>
        </div>
        <button
          ref="ctaRef"
          type="button"
          class="cta"
          :class="{ added }"
          :disabled="product.variants.length > 0 && !selectedVariant"
          @click="handleAddToCart"
        >
          <Transition
            name="cta-swap"
            mode="out-in"
          >
            <span
              v-if="added"
              key="added"
              class="cta-label"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  ref="checkPathRef"
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Adicionado!
            </span>
            <span
              v-else
              key="idle"
              class="cta-label"
            >Adicionar ao carrinho</span>
          </Transition>
        </button>
        <button
          type="button"
          class="wishlist-btn"
          :class="{ active: wishlisted }"
          :aria-label="wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
          :aria-pressed="wishlisted"
          @click="toggleWishlist(product)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            :fill="wishlisted ? 'currentColor' : 'none'"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { productsApi } from '../lib/api'
import { useCart } from '../composables/useCart'
import { useWishlist } from '../composables/useWishlist'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const product = ref(null)
const loading = ref(true)
const error = ref('')
const quantity = ref(1)
const added = ref(false)
const search = ref('')
const selectedVariant = ref(null)
const selectedImageIndex = ref(0)
const ctaRef = ref(null)
const checkPathRef = ref(null)

const { addItem } = useCart()
const { isWishlisted, toggleWishlist } = useWishlist()

const wishlisted = computed(() => (product.value ? isWishlisted(product.value.slug) : false))

const isBookProduct = computed(() => product.value?.variantKind === 'book')

const filteredVariants = computed(() => {
  if (!product.value) return []
  const term = search.value.trim().toLowerCase()
  if (!term) return product.value.variants

  return product.value.variants.filter((variant) =>
    [variant.name, variant.author, variant.series]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term))
  )
})

const displayImage = computed(
  () =>
    selectedVariant.value?.image?.url ??
    product.value?.images?.[selectedImageIndex.value]?.url ??
    product.value?.images?.[0]?.url ??
    null
)

const showGalleryThumbs = computed(
  () => !selectedVariant.value?.image && (product.value?.images?.length ?? 0) > 1
)

async function loadProduct() {
  loading.value = true
  error.value = ''
  product.value = null
  quantity.value = 1
  added.value = false
  search.value = ''
  selectedVariant.value = null
  selectedImageIndex.value = 0

  try {
    const data = await productsApi.get(props.slug)
    product.value = data.product
  } catch {
    error.value = 'Não encontramos esse produto.'
  } finally {
    loading.value = false
  }
}

let addedTimeout = null

async function handleAddToCart() {
  addItem(product.value, selectedVariant.value, quantity.value)
  added.value = true

  gsap
    .timeline()
    .to(ctaRef.value, { scale: 0.94, duration: 0.1, ease: 'power1.out' })
    .to(ctaRef.value, { scale: 1.04, duration: 0.16, ease: 'power2.out' })
    .to(ctaRef.value, { scale: 1, duration: 0.12, ease: 'power1.inOut', clearProps: 'transform' })

  await nextTick()
  const path = checkPathRef.value
  if (path) {
    const length = path.getTotalLength()
    gsap.fromTo(
      path,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }
    )
  }

  clearTimeout(addedTimeout)
  addedTimeout = setTimeout(() => {
    added.value = false
  }, 1600)
}

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

onMounted(loadProduct)
watch(() => props.slug, loadProduct)
</script>

<style scoped>
.state {
  color: var(--color-text-muted);
}

.state.error {
  color: var(--color-danger);
}

.product {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  align-items: start;
}

.gallery {
  position: sticky;
  top: calc(var(--header-height) + var(--announcement-height) + var(--space-6));
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.image-wrap {
  aspect-ratio: 1;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
}

.thumbs {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.thumb {
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border-soft);
  background: var(--color-surface);
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.15s ease;
}

.thumb:hover {
  border-color: var(--color-border);
}

.thumb.selected {
  border-color: var(--color-primary);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.skeleton-line {
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
}

.sk-category {
  width: 30%;
  height: 12px;
}

.sk-title {
  width: 70%;
  height: 26px;
  margin-bottom: var(--space-4);
}

.sk-price {
  width: 35%;
  height: 20px;
  margin-bottom: var(--space-5);
}

.sk-text {
  width: 100%;
  height: 14px;
}

.sk-text.short {
  width: 60%;
  margin-bottom: var(--space-6);
}

.sk-cta {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-md);
}

.shimmer {
  background: linear-gradient(100deg,
      var(--color-border-soft) 30%,
      var(--color-border) 50%,
      var(--color-border-soft) 70%);
  background-size: 200% 100%;
  animation: shimmer-sweep 1.4s ease-in-out infinite;
}

@keyframes shimmer-sweep {
  from {
    background-position: 150% 0;
  }

  to {
    background-position: -50% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
    background: var(--color-border-soft);
  }
}

.image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 64px;
  color: var(--color-brown-500);
}

.category {
  margin: 0 0 var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-brown-600);
}

h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-3);
}

.price {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  margin: 0 0 var(--space-5);
}

.short-description {
  font-size: var(--text-md);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-4);
}

.description {
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: 1.7;
  margin: 0 0 var(--space-6);
}

.section-label {
  font-size: var(--text-sm);
  color: var(--color-brown-600);
  margin: 0 0 var(--space-3);
}

.variant-picker {
  padding-top: var(--space-5);
  margin-bottom: var(--space-6);
  border-top: 1.5px dashed var(--color-border-dashed);
}

.search {
  width: 100%;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text);
  margin-bottom: var(--space-3);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
  outline: none;
}

.selected-variant {
  font-size: var(--text-sm);
  color: var(--color-brown-700);
  margin: 0 0 var(--space-3);
}

.variant-list {
  position: relative;
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-right: var(--space-1);
}

.variant-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-solid);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
}

.variant-option:hover {
  border-color: var(--color-border);
}

.variant-option:active {
  transform: scale(0.98);
}

.variant-option.selected {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}

.variant-option img,
.variant-image-fallback {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.variant-image-fallback {
  background: var(--color-cream-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  color: var(--color-brown-500);
  font-size: var(--text-sm);
}

.variant-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.variant-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.variant-meta {
  font-size: var(--text-xs);
  color: var(--color-brown-600);
}

.no-results {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.add-to-cart {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.qty-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-3);
}

.qty-row button {
  border: none;
  background: none;
  font-size: var(--text-lg);
  color: var(--color-text);
  cursor: pointer;
  width: 24px;
  border-radius: var(--radius-sm);
  transition: background-color 0.12s ease, transform 0.1s ease;
}

.qty-row button:hover {
  background: var(--color-surface);
}

.qty-row button:active {
  transform: scale(0.85);
}

.cta {
  flex: 1;
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
  overflow: hidden;
}

.cta:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-spine);
}

.cta:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.cta:disabled {
  opacity: 0.6;
  cursor: default;
}

.cta.added {
  background: var(--color-brown-900);
}

.cta-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
}

.wishlist-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-solid);
  color: var(--color-brown-700);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.wishlist-btn:hover {
  border-color: var(--color-danger);
}

.wishlist-btn:active {
  transform: scale(0.92);
}

.wishlist-btn.active {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.cta-swap-enter-active,
.cta-swap-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.cta-swap-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.cta-swap-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.variant-move,
.variant-enter-active,
.variant-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.variant-enter-from,
.variant-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.variant-leave-active {
  position: absolute;
  width: 100%;
}

@media (max-width: 720px) {
  .product {
    grid-template-columns: 1fr;
  }

  .gallery {
    position: static;
  }

  .image-wrap {
    aspect-ratio: 4 / 3;
  }
}
</style>