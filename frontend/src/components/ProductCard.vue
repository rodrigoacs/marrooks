<template>
  <RouterLink
    :to="`/produto/${product.slug}`"
    class="card"
  >
    <div class="image-wrap">
      <img
        v-if="product.images?.[0]?.url"
        :src="product.images[0].url"
        :alt="product.images[0].alt ?? product.name"
      />
      <div
        v-else
        class="image-fallback"
      >
        {{ product.name.charAt(0) }}
      </div>
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
    </div>
  </RouterLink>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<style scoped>
.card {
  display: block;
  text-decoration: none;
  color: var(--color-text);
}

.image-wrap {
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
</style>