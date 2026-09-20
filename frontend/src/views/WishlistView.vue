<template>
  <div>
    <p class="summary-label">Favoritos</p>
    <h1>Seus livrinhos favoritos</h1>

    <p
      v-if="items.length === 0"
      class="empty"
    >
      Você ainda não favoritou nenhum produto.
      <RouterLink to="/catalogo">Ver catálogo</RouterLink>
    </p>

    <div
      v-else
      class="grid"
    >
      <ProductCard
        v-for="(product, index) in items"
        :key="product.slug"
        :product="product"
        :index="index"
      />
    </div>
  </div>
</template>

<script setup>
import ProductCard from '../components/ProductCard.vue'
import { useWishlist } from '../composables/useWishlist'

const { items } = useWishlist()
</script>

<style scoped>
.summary-label {
  font-size: var(--text-sm);
  color: var(--color-brown-600);
  margin: 0 0 var(--space-3);
}

h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-6);
}

.empty {
  color: var(--color-text-muted);
}

.empty a {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-6);
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>