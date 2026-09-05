<template>
  <p
    v-if="loading"
    class="state"
  >Carregando...</p>

  <p
    v-else-if="error"
    class="state error"
  >{{ error }}</p>

  <div
    v-else-if="product"
    class="product"
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
      >{{ product.name.charAt(0) }}</div>
    </div>

    <div class="info">
      <p
        v-if="product.category"
        class="category"
      >{{ product.category.name }}</p>
      <h1>{{ product.name }}</h1>
      <p class="price">
        <span
          v-if="product.comparePrice"
          class="compare"
        >{{ formatPrice(product.comparePrice) }}</span>
        {{ formatPrice(product.price) }}
      </p>

      <p
        v-if="product.shortDescription"
        class="short-description"
      >{{ product.shortDescription }}</p>

      <p
        v-if="product.description"
        class="description"
      >{{ product.description }}</p>

      <p
        v-if="product.stock === 0"
        class="out-of-stock"
      >Sem estoque no momento.</p>

      <div
        v-else
        class="add-to-cart"
      >
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
          type="button"
          class="cta"
          @click="handleAddToCart"
        >{{ added ? 'Adicionado!' : 'Adicionar ao carrinho' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { productsApi } from '../lib/api'
import { useCart } from '../composables/useCart'

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

const { addItem } = useCart()

async function loadProduct() {
  loading.value = true
  error.value = ''
  product.value = null
  quantity.value = 1
  added.value = false

  try {
    const data = await productsApi.get(props.slug)
    product.value = data.product
  } catch {
    error.value = 'Não encontramos esse produto.'
  } finally {
    loading.value = false
  }
}

function handleAddToCart() {
  addItem(product.value, quantity.value)
  added.value = true
  setTimeout(() => {
    added.value = false
  }, 1500)
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

@media (max-width: 720px) {
  .product {
    grid-template-columns: 1fr;
  }
}

.image-wrap {
  aspect-ratio: 1;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
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

.compare {
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-brown-500);
  text-decoration: line-through;
  margin-right: var(--space-2);
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
  margin: 0 0 var(--space-7);
}

.out-of-stock {
  color: var(--color-danger);
  font-weight: var(--weight-semibold);
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
}
</style>