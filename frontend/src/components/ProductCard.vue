<template>
  <RouterLink
    ref="cardRef"
    :to="`/produto/${product.slug}`"
    class="card"
  >
    <div class="image-wrap">
      <img
        ref="imageRef"
        v-if="product.images?.[0]?.url"
        :src="product.images[0].url"
        :alt="product.images[0].alt ?? product.name"
        :class="{ loaded: imageLoaded }"
        @load="imageLoaded = true"
      />
      <div
        v-else
        class="image-fallback"
      >
        {{ product.name.charAt(0) }}
      </div>

      <div
        v-if="product.featured || discountPercent || product.bestSeller"
        class="badges"
      >
        <span
          v-if="product.bestSeller"
          class="badge badge-bestseller"
        >Mais vendido</span>
        <span
          v-if="product.featured"
          class="badge badge-featured"
        >Destaque</span>
        <span
          v-if="discountPercent"
          class="badge badge-discount"
        >-{{ discountPercent }}%</span>
      </div>

      <button
        type="button"
        class="wishlist-btn"
        :class="{ active: wishlisted }"
        :aria-label="wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
        :aria-pressed="wishlisted"
        @click.prevent.stop="toggleWishlist(product)"
      >
        <svg
          width="18"
          height="18"
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
    <div class="info">
      <p
        v-if="product.category"
        class="category"
      >{{ product.category.name }}</p>
      <h3 class="name">{{ product.name }}</h3>
      <p class="price">
        <span
          v-if="product.comparePrice"
          class="compare"
        >{{ formatPrice(product.comparePrice) }}</span>
        {{ formatPrice(product.price) }}
      </p>
      <p
        v-if="product.soldCount >= SOCIAL_PROOF_THRESHOLD"
        class="social-proof"
      >{{ product.soldCount }} vendidos</p>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { useWishlist } from '../composables/useWishlist'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
})

const { isWishlisted, toggleWishlist } = useWishlist()

const wishlisted = computed(() => isWishlisted(props.product.slug))

const imageLoaded = ref(false)
const cardRef = ref(null)
const imageRef = ref(null)

const SOCIAL_PROOF_THRESHOLD = 5

const discountPercent = computed(() => {
  const { price, comparePrice } = props.product
  if (!comparePrice || comparePrice <= price) return null
  return Math.round((1 - price / comparePrice) * 100)
})

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

onMounted(() => {
  const el = cardRef.value?.$el
  if (!el) return

  gsap.from(el, {
    opacity: 0,
    y: 28,
    duration: 0.55,
    delay: Math.min(props.index, 10) * 0.06,
    ease: 'power3.out',
  })

  const liftY = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power2.out' })
  const liftScaleX = gsap.quickTo(el, 'scaleX', { duration: 0.35, ease: 'power2.out' })
  const liftScaleY = gsap.quickTo(el, 'scaleY', { duration: 0.35, ease: 'power2.out' })
  const imageScaleX = imageRef.value
    ? gsap.quickTo(imageRef.value, 'scaleX', { duration: 0.5, ease: 'power2.out' })
    : null
  const imageScaleY = imageRef.value
    ? gsap.quickTo(imageRef.value, 'scaleY', { duration: 0.5, ease: 'power2.out' })
    : null

  el.addEventListener('mouseenter', () => {
    liftY(-6)
    liftScaleX(1.015)
    liftScaleY(1.015)
    imageScaleX?.(1.08)
    imageScaleY?.(1.08)
  })
  el.addEventListener('mouseleave', () => {
    liftY(0)
    liftScaleX(1)
    liftScaleY(1)
    imageScaleX?.(1)
    imageScaleY?.(1)
  })
})
</script>

<style scoped>
.card {
  display: block;
  text-decoration: none;
  padding: var(--space-4);
  color: var(--color-text);
  border: 2px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  will-change: transform;
}

.card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-spine);
}

.image-wrap {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
  margin-bottom: var(--space-3);
}

.image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrap img.loaded {
  opacity: 1;
}

.image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  color: var(--color-brown-500);
}

.badges {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.wishlist-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  color: var(--color-brown-700);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, color 0.15s ease;
}

.wishlist-btn:hover {
  transform: scale(1.1);
}

.wishlist-btn.active {
  color: var(--color-danger);
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: var(--weight-semibold);
  line-height: 1.6;
}

.badge-featured {
  background: var(--color-rust-600);
  color: var(--color-cream-100);
}

.badge-bestseller {
  background: var(--color-brown-700);
  color: var(--color-cream-100);
}

.badge-discount {
  background: var(--color-brown-900);
  color: var(--color-cream-100);
}

.category {
  margin: 0 0 2px;
  font-size: var(--text-xs);
  color: var(--color-brown-600);
}

.name {
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  margin: 0 0 4px;
}

.price {
  margin: 0;
  font-family: var(--font-display);
  font-weight: var(--weight-medium);
  font-size: var(--text-md);
}

.compare {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-brown-500);
  text-decoration: line-through;
  margin-right: var(--space-2);
}

.social-proof {
  margin: 2px 0 0;
  font-size: var(--text-xs);
  color: var(--color-brown-600);
}
</style>