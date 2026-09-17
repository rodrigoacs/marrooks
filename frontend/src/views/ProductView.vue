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
        v-if="displayImage"
        :src="displayImage"
        :alt="selectedVariant?.name ?? product.name"
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

        <p
          v-if="selectedVariant"
          class="selected-variant"
        >
          Selecionado: <strong>{{ selectedVariant.name }}</strong>
          <template v-if="selectedVariant.author"> — {{ selectedVariant.author }}</template>
        </p>

        <div class="variant-list">
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
            class="no-results"
          >Nenhuma variação encontrada.</p>
        </div>
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
          type="button"
          class="cta"
          :disabled="product.variants.length > 0 && !selectedVariant"
          @click="handleAddToCart"
        >{{ added ? 'Adicionado!' : 'Adicionar ao carrinho' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
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
const search = ref('')
const selectedVariant = ref(null)

const { addItem } = useCart()

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
  () => selectedVariant.value?.image?.url ?? product.value?.images?.[0]?.url ?? null
)

async function loadProduct() {
  loading.value = true
  error.value = ''
  product.value = null
  quantity.value = 1
  added.value = false
  search.value = ''
  selectedVariant.value = null

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
  addItem(product.value, selectedVariant.value, quantity.value)
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

.image-wrap {
  aspect-ratio: 1;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
  position: sticky;
  top: calc(var(--header-height) + var(--space-6));
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
}

.selected-variant {
  font-size: var(--text-sm);
  color: var(--color-brown-700);
  margin: 0 0 var(--space-3);
}

.variant-list {
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
}

.variant-option.selected {
  border-color: var(--color-primary);
  background: rgba(179, 77, 43, 0.06);
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

.cta:disabled {
  opacity: 0.6;
  cursor: default;
}

/* Precisa vir por último no arquivo: como tem a mesma especificidade da
   regra base .image-wrap, se viesse antes dela seria sobrescrita mesmo
   dentro do breakpoint — foi exatamente esse bug que deixou a imagem
   grande e "sticky" no celular. */
@media (max-width: 720px) {
  .product {
    grid-template-columns: 1fr;
  }

  .image-wrap {
    aspect-ratio: 4 / 3;
    position: static;
  }
}
</style>