<template>
  <section
    ref="heroRef"
    class="hero"
  >
    <div class="hero-text">
      <p
        ref="eyebrowRef"
        class="eyebrow"
      >Marrooks</p>
      <h1 ref="titleRef">Literatura que cabe na palma da mão.</h1>
      <p
        ref="subtitleRef"
        class="hero-subtitle"
      >
        Mini livros, estantes, chaveiros e muitos mais. Tudo feito com carinho, para você levar sua paixão para
        qualquer lugar.
      </p>
      <RouterLink
        ref="ctaRef"
        to="/catalogo"
        class="cta"
      >Ver catálogo</RouterLink>
    </div>

    <div
      ref="heroImageRef"
      class="hero-image"
    >
      <img
        src="/produtos/mini-livro.jpg"
        alt="Mini livro Marrooks"
        class="hero-image-main"
      />
      <img
        src="/produtos/estante.jpg"
        alt="Estante para mini livros Marrooks"
        class="hero-image-accent"
      />
    </div>
  </section>

  <section
    v-if="loading || featured.length"
    ref="featuredRef"
    class="featured"
  >
    <h2>Destaques</h2>

    <div
      v-if="loading"
      class="grid"
    >
      <ProductCardSkeleton
        v-for="n in 4"
        :key="n"
      />
    </div>

    <div
      v-else
      class="grid"
    >
      <ProductCard
        v-for="(product, index) in featured"
        :key="product.slug"
        :product="product"
        :index="index"
      />
    </div>
  </section>

  <p
    v-if="error"
    class="state error"
  >{{ error }}</p>

  <AboutSection />
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import ProductCard from '../components/ProductCard.vue'
import ProductCardSkeleton from '../components/ProductCardSkeleton.vue'
import AboutSection from '../components/AboutSection.vue'
import { productsApi } from '../lib/api'

const featured = ref([])
const loading = ref(true)
const error = ref('')

const heroRef = ref(null)
const eyebrowRef = ref(null)
const titleRef = ref(null)
const subtitleRef = ref(null)
const ctaRef = ref(null)
const heroImageRef = ref(null)
const featuredRef = ref(null)
let featuredObserver = null

function playHeroTimeline() {
  const cta = ctaRef.value?.$el
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.from(eyebrowRef.value, { opacity: 0, y: 12, duration: 0.4 })
    .from(titleRef.value, { opacity: 0, y: 20, duration: 0.55 }, '-=0.25')
    .from(subtitleRef.value, { opacity: 0, y: 16, duration: 0.5 }, '-=0.35')
    .from(cta, { opacity: 0, y: 12, duration: 0.4 }, '-=0.3')
    .from(
      heroImageRef.value,
      { opacity: 0, scale: 0.92, duration: 0.7, ease: 'power2.out' },
      '-=0.5'
    )
}

onMounted(async () => {
  playHeroTimeline()

  try {
    const data = await productsApi.list({ featured: true })
    featured.value = data.products
  } catch {
    error.value = 'Não foi possível carregar os destaques agora.'
  } finally {
    loading.value = false
  }

  await nextTick()
  if (featuredRef.value) {
    featuredObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        gsap.from(entry.target, {
          opacity: 0,
          y: 32,
          duration: 0.6,
          ease: 'power2.out',
        })
        featuredObserver.disconnect()
      },
      { threshold: 0, rootMargin: '0px 0px -15% 0px' }
    )
    featuredObserver.observe(featuredRef.value)
  }
})

onBeforeUnmount(() => {
  featuredObserver?.disconnect()
})
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: var(--space-9);
  margin-bottom: var(--space-10);
}

.hero-text {
  max-width: 46ch;
}

.eyebrow {
  margin: 0 0 var(--space-3);
  color: var(--color-brown-600);
  font-size: var(--text-sm);
}

h1 {
  font-size: var(--text-2xl);
  line-height: 1.25;
  margin-bottom: var(--space-4);
}

.hero-subtitle {
  color: var(--color-text-muted);
  font-size: var(--text-md);
  line-height: 1.6;
  margin: 0 0 var(--space-6);
}

.cta {
  display: inline-block;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  text-decoration: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-spine);
}

.cta:active {
  transform: translateY(0) scale(0.98);
}

.hero-image {
  position: relative;
  aspect-ratio: 1;
}

.hero-image-main {
  width: 85%;
  height: 85%;
  object-fit: cover;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-spine);
  border: 1.5px solid var(--color-border-soft);
}

.hero-image-accent {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 45%;
  height: 45%;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 4px solid var(--color-bg);
  box-shadow: var(--shadow-spine);
}

.featured h2 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-5);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-6);
}

.state {
  color: var(--color-text-muted);
}

.state.error {
  color: var(--color-danger);
}

@media (max-width: 720px) {
  .hero {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .hero-image {
    aspect-ratio: 4 / 3;
    order: -1;
  }

  .hero-image-main {
    width: 78%;
    height: 78%;
  }
}
</style>