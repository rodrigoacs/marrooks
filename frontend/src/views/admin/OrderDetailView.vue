<template>
  <div class="detail-page">
    <RouterLink
      to="/admin/pedidos"
      class="back"
    >&larr; Pedidos</RouterLink>

    <p
      v-if="loading"
      class="state"
    >Carregando...</p>
    <p
      v-else-if="error"
      class="state error"
    >{{ error }}</p>

    <template v-else-if="order">
      <h1>Pedido {{ order.reference }}</h1>

      <div class="grid">
        <div class="card">
          <p class="label">Cliente</p>
          <p>{{ order.customer.name }}</p>
          <p class="muted">{{ order.customer.email }}</p>
          <p
            v-if="order.customer.phone"
            class="muted"
          >{{ order.customer.phone }}</p>
        </div>

        <div class="card">
          <p class="label">Entrega</p>
          <p>{{ order.shipping.street }}, {{ order.shipping.number }}</p>
          <p
            v-if="order.shipping.complement"
            class="muted"
          >{{ order.shipping.complement }}</p>
          <p class="muted">{{ order.shipping.district }} — {{ order.shipping.city }}/{{ order.shipping.state }}</p>
          <p class="muted">CEP {{ order.shipping.postalCode }}</p>
          <p
            v-if="order.shipping.company"
            class="muted"
          >{{ order.shipping.company }} · {{ order.shipping.serviceName }}</p>
        </div>
      </div>

      <p class="label">Itens</p>
      <table class="table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Preço unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in order.items"
            :key="item.slug"
          >
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatPrice(item.unitPrice) }}</td>
            <td>{{ formatPrice(item.unitPrice * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals">
        <div class="row"><span>Subtotal</span><span>{{ formatPrice(order.subtotal) }}</span></div>
        <div class="row"><span>Frete</span><span>{{ formatPrice(order.shippingCost) }}</span></div>
        <div class="row total"><span>Total</span><span>{{ formatPrice(order.total) }}</span></div>
      </div>

      <div class="status-section">
        <p class="label">Status do pedido</p>
        <div class="status-row">
          <select v-model="statusInput">
            <option
              v-for="status in statuses"
              :key="status.value"
              :value="status.value"
            >{{ status.label }}</option>
          </select>
          <input
            v-model="trackingInput"
            type="text"
            placeholder="Código de rastreio (opcional)"
          />
          <button
            type="button"
            class="cta"
            :disabled="saving"
            @click="handleUpdate"
          >{{ saving ? 'Salvando...' : 'Atualizar' }}</button>
        </div>
        <p
          v-if="updateError"
          class="error"
        >{{ updateError }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { adminOrdersApi, ApiError } from '../../lib/api'

const props = defineProps({
  reference: {
    type: String,
    required: true,
  },
})

const order = ref(null)
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const updateError = ref('')
const statusInput = ref('')
const trackingInput = ref('')

const statuses = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
]

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function loadOrder() {
  loading.value = true
  error.value = ''
  try {
    const data = await adminOrdersApi.get(props.reference)
    order.value = data.order
    statusInput.value = data.order.status
    trackingInput.value = data.order.shipping.trackingCode ?? ''
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Não foi possível carregar o pedido.'
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  updateError.value = ''
  saving.value = true
  try {
    const data = await adminOrdersApi.update(props.reference, {
      status: statusInput.value,
      trackingCode: trackingInput.value || undefined,
    })
    order.value = { ...order.value, ...data.order }
  } catch (err) {
    updateError.value = err instanceof ApiError ? err.message : 'Não foi possível atualizar o pedido.'
  } finally {
    saving.value = false
  }
}

onMounted(loadOrder)
</script>

<style scoped>
.detail-page {
  max-width: 720px;
}

.back {
  display: inline-block;
  margin-bottom: var(--space-5);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  text-decoration: none;
}

h1 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-6);
}

.state {
  color: var(--color-text-muted);
}

.state.error {
  color: var(--color-danger);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  margin-bottom: var(--space-6);
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.card p {
  margin: 0 0 4px;
}

.label {
  font-size: var(--text-sm);
  color: var(--color-brown-600);
  margin: 0 0 var(--space-3);
}

.muted {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  margin-bottom: var(--space-6);
}

.table th {
  text-align: left;
  color: var(--color-brown-600);
  font-weight: var(--weight-medium);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1.5px solid var(--color-border);
}

.table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border-soft);
}

.totals {
  max-width: 280px;
  margin-left: auto;
  margin-bottom: var(--space-7);
}

.totals .row {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-brown-700);
  margin-bottom: var(--space-2);
}

.totals .row.total {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.status-section {
  border-top: 1.5px dashed var(--color-border-dashed);
  padding-top: var(--space-5);
}

.status-row {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}

.status-row select,
.status-row input {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.status-row input {
  flex: 1;
  min-width: 200px;
}

.cta {
  padding: var(--space-2) var(--space-5);
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

.error {
  margin-top: var(--space-3);
  color: var(--color-danger);
  font-size: var(--text-sm);
}
</style>