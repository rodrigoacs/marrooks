<template>
  <section class="hero">
    <p class="eyebrow">Marrooks</p>
    <h1>Mini livros e papelaria.</h1>
    <RouterLink
      to="/catalogo"
      class="cta"
    >Ver catálogo</RouterLink>
  </section>

  <section
    v-if="loading || featured.length"
    class="featured"
  >
    <h2>Destaques</h2>

    <p
      v-if="loading"
      class="state"
    >Carregando...</p>

    <div
      v-else
      class="grid"
    >
      <ProductCard
        v-for="product in featured"
        :key="product.slug"
        :product="product"
      />
    </div>
  </section>

  <p
    v-if="error"
    class="state error"
  >{{ error }}</p>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import { productsApi } from '../lib/api'

const featured = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await productsApi.list({ featured: true })
    featured.value = data.products
  } catch {
    error.value = 'Não foi possível carregar os destaques agora.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero {
  max-width: 46ch;
  margin-bottom: var(--space-10);
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

.cta {
  display: inline-block;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  text-decoration: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
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
</style>