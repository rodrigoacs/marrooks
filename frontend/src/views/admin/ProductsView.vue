<template>
  <div>
    <div class="header">
      <h1>Produtos</h1>
      <RouterLink
        to="/admin/produtos/novo"
        class="cta"
      >Novo produto</RouterLink>
    </div>

    <p
      v-if="loading"
      class="state"
    >Carregando...</p>
    <p
      v-else-if="error"
      class="state error"
    >{{ error }}</p>
    <p
      v-else-if="products.length === 0"
      class="state"
    >Nenhum produto cadastrado ainda.</p>

    <table
      v-else
      class="table"
    >
      <thead>
        <tr>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Preço</th>
          <th>Estoque</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in products"
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
          <td>{{ product.stock }}</td>
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
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { adminProductsApi, ApiError } from '../../lib/api'

const products = ref([])
const loading = ref(true)
const error = ref('')

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

.cta {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  text-decoration: none;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
}

.state {
  color: var(--color-text-muted);
}

.state.error {
  color: var(--color-danger);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
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
  background: var(--color-cream-100);
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
  background: rgba(179, 77, 43, 0.12);
  color: var(--color-primary);
}

.badge.inactive {
  background: rgba(81, 47, 24, 0.1);
  color: var(--color-brown-600);
}

.badge.featured {
  background: rgba(216, 104, 65, 0.15);
  color: var(--color-coral-500);
}

.actions {
  display: flex;
  gap: var(--space-3);
  white-space: nowrap;
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
</style>