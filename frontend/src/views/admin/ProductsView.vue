<template>
  <div>
    <div class="header">
      <div>
        <h1>Produtos</h1>
        <p class="subtitle">Gerencie catálogo, preços e disponibilidade da loja.</p>
      </div>
      <RouterLink
        to="/admin/produtos/novo"
        class="cta"
      >+ Novo produto</RouterLink>
    </div>

    <div
      v-if="!loading && !error"
      class="stats-grid"
    >
      <div class="stat-card">
        <span class="stat-label">Total de produtos</span>
        <span class="stat-value">{{ totalCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Ativos</span>
        <span class="stat-value">{{ activeCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Inativos</span>
        <span class="stat-value">{{ inactiveCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Em destaque</span>
        <span class="stat-value">{{ featuredCount }}</span>
      </div>
    </div>

    <p
      v-if="loading"
      class="state"
    >Carregando...</p>
    <p
      v-else-if="error"
      class="state error"
    >{{ error }}</p>

    <template v-else>
      <div class="toolbar">
        <label class="search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="M21 21l-4.3-4.3"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nome ou slug..."
          />
        </label>

        <div class="filter-tabs">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            class="filter-tab"
            :class="{ active: statusFilter === option.value }"
            @click="statusFilter = option.value"
          >{{ option.label }}</button>
        </div>

        <div class="view-toggle">
          <button
            type="button"
            class="view-btn"
            :class="{ active: viewMode === 'list' }"
            title="Ver em lista"
            @click="viewMode = 'list'"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="view-btn"
            :class="{ active: viewMode === 'grid' }"
            title="Ver em grade"
            @click="viewMode = 'grid'"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <rect
                x="4"
                y="4"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <rect
                x="13"
                y="4"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <rect
                x="4"
                y="13"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <rect
                x="13"
                y="13"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
            </svg>
          </button>
        </div>
      </div>

      <p
        v-if="products.length === 0"
        class="state"
      >Nenhum produto cadastrado ainda.</p>
      <p
        v-else-if="filteredProducts.length === 0"
        class="state"
      >Nenhum produto encontrado para esse filtro.</p>

      <!-- Visão em lista -->
      <div
        v-else-if="viewMode === 'list'"
        class="table-scroll"
      >
        <table class="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Variações</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
            >
              <td>
                <div class="product-cell">
                  <img
                    v-if="product.images?.[0]?.url"
                    :src="product.images[0].url"
                    :alt="product.name"
                  />
                  <div
                    v-else
                    class="image-fallback"
                  >{{ product.name.charAt(0) }}</div>
                  <div>
                    <div class="name">{{ product.name }}</div>
                    <div class="slug">{{ product.slug }}</div>
                  </div>
                </div>
              </td>
              <td>{{ product.category?.name ?? '—' }}</td>
              <td>{{ formatPrice(product.price) }}</td>
              <td>
                <RouterLink :to="`/admin/produtos/${product.id}/variacoes`">{{ product.variantCount }} variaç{{
                  product.variantCount === 1 ? 'ão' : 'ões' }}</RouterLink>
              </td>
              <td>
                <span
                  class="badge"
                  :class="product.active ? 'active' : 'inactive'"
                >{{ product.active ? 'Ativo' : 'Inativo' }}</span>
                <span
                  v-if="product.featured"
                  class="badge featured"
                >Destaque</span>
              </td>
              <td class="actions">
                <RouterLink :to="`/admin/produtos/${product.id}/editar`">Editar</RouterLink>
                <button
                  v-if="product.active"
                  type="button"
                  class="link-btn danger"
                  @click="handleDeactivate(product)"
                >Desativar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Visão em grade -->
      <div
        v-else
        class="grid-view"
      >
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
        >
          <div class="image-wrap">
            <img
              v-if="product.images?.[0]?.url"
              :src="product.images[0].url"
              :alt="product.name"
            />
            <div
              v-else
              class="image-fallback grid-fallback"
            >{{ product.name.charAt(0) }}</div>
            <span
              class="badge card-badge"
              :class="product.active ? 'active' : 'inactive'"
            >{{ product.active ? 'Ativo' : 'Inativo' }}</span>
          </div>
          <div class="card-body">
            <p class="name">{{ product.name }}</p>
            <p class="slug">{{ product.category?.name ?? 'Sem categoria' }}</p>
            <div class="card-meta">
              <span class="price">{{ formatPrice(product.price) }}</span>
              <RouterLink :to="`/admin/produtos/${product.id}/variacoes`">{{ product.variantCount }} variaç{{
                product.variantCount === 1 ? 'ão' : 'ões' }}</RouterLink>
            </div>
            <div class="card-actions">
              <RouterLink :to="`/admin/produtos/${product.id}/editar`">Editar</RouterLink>
              <button
                v-if="product.active"
                type="button"
                class="link-btn danger"
                @click="handleDeactivate(product)"
              >Desativar</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { adminProductsApi, ApiError } from '../../lib/api'

const products = ref([])
const loading = ref(true)
const error = ref('')

const searchQuery = ref('')
const statusFilter = ref('all')
const viewMode = ref('list')

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'featured', label: 'Destaque' },
]

const totalCount = computed(() => products.value.length)
const activeCount = computed(() => products.value.filter((p) => p.active).length)
const inactiveCount = computed(() => products.value.filter((p) => !p.active).length)
const featuredCount = computed(() => products.value.filter((p) => p.featured).length)

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return products.value.filter((product) => {
    const matchesQuery =
      !query || product.name.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && product.active) ||
      (statusFilter.value === 'inactive' && !product.active) ||
      (statusFilter.value === 'featured' && product.featured)

    return matchesQuery && matchesStatus
  })
})

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    const data = await adminProductsApi.list()
    products.value = data.products
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Não foi possível carregar os produtos.'
  } finally {
    loading.value = false
  }
}

async function handleDeactivate(product) {
  if (!confirm(`Desativar "${product.name}"? Ele sai da vitrine, mas o histórico de pedidos é mantido.`)) {
    return
  }
  try {
    await adminProductsApi.remove(product.id)
    product.active = false
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'Não foi possível desativar o produto.')
  }
}

onMounted(loadProducts)
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

h1 {
  font-size: var(--text-2xl);
}

.subtitle {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.cta {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  text-decoration: none;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.state {
  color: var(--color-text-muted);
}

.state.error {
  color: var(--color-danger);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-5);
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-solid);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: var(--weight-medium);
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.search-box {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  min-height: 44px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-solid);
  color: var(--color-text-muted);
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text);
}

.filter-tabs {
  display: flex;
  gap: var(--space-1);
  padding: 3px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
}

.filter-tab {
  border: none;
  background: none;
  padding: var(--space-2) var(--space-3);
  min-height: 36px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
}

.filter-tab.active {
  background: var(--color-surface-solid);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  box-shadow: 0 1px 2px rgba(81, 47, 24, 0.12);
}

.view-toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
}

.view-btn {
  border: none;
  background: none;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: pointer;
}

.view-btn.active {
  background: var(--color-surface-solid);
  color: var(--color-primary);
  box-shadow: 0 1px 2px rgba(81, 47, 24, 0.12);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table th {
  text-align: left;
  color: var(--color-brown-600);
  font-weight: var(--weight-medium);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1.5px solid var(--color-border);
}

.table td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border-soft);
  vertical-align: middle;
}

.table td a {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  text-decoration: none;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.product-cell img,
.image-fallback {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.image-fallback {
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  color: var(--color-brown-500);
}

.name {
  font-weight: var(--weight-medium);
}

.slug {
  color: var(--color-brown-500);
  font-size: var(--text-xs);
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  margin-right: var(--space-1);
}

.badge.active {
  background: rgba(22, 163, 74, 0.12);
  color: var(--color-success);
}

.badge.inactive {
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-text-muted);
}

.badge.featured {
  background: rgba(217, 119, 6, 0.14);
  color: var(--color-warning);
}

.actions {
  display: flex;
  gap: var(--space-3);
  white-space: nowrap;
}

.actions a,
.actions button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.actions a {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  text-decoration: none;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: var(--weight-semibold);
  cursor: pointer;
}

.link-btn.danger {
  color: var(--color-danger);
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-5);
}

.product-card {
  display: flex;
  flex-direction: column;
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-solid);
  overflow: hidden;
}

.image-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--color-surface);
}

.image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.grid-fallback {
  width: 100%;
  height: 100%;
  border-radius: 0;
  font-size: var(--text-2xl);
}

.card-badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  margin-right: 0;
}

.card-body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.card-body .name {
  font-size: var(--text-base);
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-size: var(--text-sm);
}

.card-meta .price {
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.card-meta a {
  color: var(--color-primary);
  font-weight: var(--weight-medium);
  font-size: var(--text-xs);
  text-decoration: none;
}

.card-actions {
  display: flex;
  justify-content: space-around;
  gap: var(--space-4);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-soft);
}

.card-actions a {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  text-decoration: none;
}
</style>