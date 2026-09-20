<template>
  <div>
    <p class="summary-label">Catálogo</p>
    <h1>{{ activeCategoryName }}</h1>

    <div class="controls">
      <div class="categories">
        <RouterLink
          to="/catalogo"
          class="chip"
          :class="{ active: !category }"
        >Todos</RouterLink>
        <RouterLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/catalogo/${cat.slug}`"
          class="chip"
          :class="{ active: category === cat.slug }"
        >{{ cat.name }}</RouterLink>
      </div>

      <input
        v-model="search"
        type="search"
        placeholder="Buscar..."
        class="search"
      />

      <select
        v-model="sort"
        class="sort"
        aria-label="Ordenar por"
      >
        <option value="relevance">Relevância</option>
        <option value="best_selling">Mais vendidos</option>
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
        <option value="name_asc">Nome (A–Z)</option>
        <option value="newest">Novidades</option>
      </select>
    </div>

    <Transition
      name="fade"
      mode="out-in"
    >
      <div
        v-if="loading"
        key="loading"
        class="grid"
      >
        <ProductCardSkeleton
          v-for="n in 8"
          :key="n"
        />
      </div>
      <p
        v-else-if="error"
        key="error"
        class="state error"
      >{{ error }}</p>
      <p
        v-else-if="products.length === 0"
        key="empty"
        class="state"
      >Nenhum produto encontrado.</p>

      <div
        v-else
        key="grid"
        class="grid"
      >
        <ProductCard
          v-for="(product, index) in products"
          :key="product.slug"
          :product="product"
          :index="index"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import ProductCardSkeleton from '../components/ProductCardSkeleton.vue'
import { categoriesApi, productsApi } from '../lib/api'

const props = defineProps({
  category: {
    type: String,
    default: '',
  },
})

const products = ref([])
const categories = ref([])
const search = ref('')
const sort = ref('relevance')
const loading = ref(true)
const error = ref('')

const activeCategoryName = computed(() => {
  if (!props.category) return 'Todos os livrinhos'
  return categories.value.find((cat) => cat.slug === props.category)?.name ?? props.category
})

let searchDebounce = null

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    const data = await productsApi.list({
      category: props.category || undefined,
      search: search.value || undefined,
      sort: sort.value !== 'relevance' ? sort.value : undefined,
    })
    products.value = data.products
  } catch {
    error.value = 'Não foi possível carregar o catálogo agora.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const data = await categoriesApi.list()
    categories.value = data.categories
  } catch {
    categories.value = []
  }
  await loadProducts()
})

watch(() => props.category, loadProducts)
watch(sort, loadProducts)

watch(search, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(loadProducts, 300)
})
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

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-7);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip {
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease,
    transform 0.15s ease;
}

.chip:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
  transform: translateY(-1px);
}

.chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

.search {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text);
  min-width: 200px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
  outline: none;
}

.sort {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.sort:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
  outline: none;
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

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>