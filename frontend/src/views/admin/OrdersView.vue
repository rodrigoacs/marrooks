<template>
  <div>
    <div class="header">
      <h1>Pedidos</h1>
      <select
        v-model="statusFilter"
        @change="loadOrders"
      >
        <option value="">Todos os status</option>
        <option
          v-for="status in statuses"
          :key="status.value"
          :value="status.value"
        >{{ status.label }}</option>
      </select>
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
      v-else-if="orders.length === 0"
      class="state"
    >Nenhum pedido encontrado.</p>

    <div
      v-else
      class="table-scroll"
    >
      <table class="table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Status</th>
            <th>Data</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.reference"
          >
            <td class="mono">{{ order.reference }}</td>
            <td>{{ order.customer.name }}</td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>
              <span
                class="badge"
                :class="order.status"
              >{{ statusLabel(order.status) }}</span>
            </td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>
              <RouterLink :to="`/admin/pedidos/${order.reference}`">Ver</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { adminOrdersApi, ApiError } from '../../lib/api'

const orders = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')

const statuses = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
]

function statusLabel(value) {
  return statuses.find((status) => status.value === value)?.label ?? value
}

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    const data = await adminOrdersApi.list({ status: statusFilter.value || undefined })
    orders.value = data.orders
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Não foi possível carregar os pedidos.'
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)
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

select {
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text);
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
}

.mono {
  font-family: monospace;
  font-size: var(--text-xs);
}

.table a {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-text-muted);
}

.badge.pending {
  background: rgba(217, 119, 6, 0.14);
  color: var(--color-warning);
}

.badge.paid,
.badge.preparing,
.badge.shipped {
  background: rgba(37, 99, 235, 0.12);
  color: var(--color-info);
}

.badge.delivered {
  background: rgba(22, 163, 74, 0.12);
  color: var(--color-success);
}

.badge.cancelled {
  background: rgba(220, 38, 38, 0.12);
  color: var(--color-danger);
}
</style>