<template>
  <div class="page">
    <div v-if="items.length === 0 && step !== 'success'">
      <h1>Seu carrinho está vazio</h1>
      <p class="sub">Volte ao catálogo para escolher seus livrinhos.</p>
      <RouterLink
        to="/catalogo"
        class="cta"
      >Ver catálogo</RouterLink>
    </div>

    <div v-else-if="step === 'success'">
      <h1>Pedido confirmado!</h1>
      <p class="sub">Número do pedido: <strong>{{ order?.reference }}</strong></p>
      <div class="note">
        <strong>Obrigada por apoiar a Marrooks.</strong>
        Você vai receber a confirmação por e-mail assim que o pagamento for compensado.
      </div>
      <RouterLink
        to="/"
        class="cta"
      >Voltar para a loja</RouterLink>
    </div>

    <template v-else>
      <h1>Confira seu pedido antes de finalizar</h1>
      <p class="sub">Livrinhos que cabem na palma da mão, feitos com carinho.</p>

      <div class="grid">
        <div>
          <p class="summary-label">Sua pilha</p>

          <div
            v-for="(item, i) in items"
            :key="item.slug"
            class="spine"
            :class="`s${(i % 3) + 1}`"
          >
            <div>
              <div class="title">{{ item.name }}</div>
              <div class="qty">{{ item.quantity }} unidade{{ item.quantity > 1 ? 's' : '' }}</div>
            </div>
            <div class="price">{{ formatPrice(item.price * item.quantity) }}</div>
          </div>

          <template v-if="step === 'details'">
            <div class="form-section">
              <p class="summary-label">Seus dados</p>
              <div class="field-row">
                <label class="field">
                  <span>Nome completo</span>
                  <input
                    v-model="customer.name"
                    type="text"
                  />
                </label>
                <label class="field">
                  <span>E-mail</span>
                  <input
                    v-model="customer.email"
                    type="email"
                  />
                </label>
              </div>
              <div class="field-row">
                <label class="field">
                  <span>Telefone</span>
                  <input
                    v-model="customer.phone"
                    type="tel"
                  />
                </label>
                <label class="field">
                  <span>CPF</span>
                  <input
                    v-model="customer.document"
                    type="text"
                  />
                </label>
              </div>
            </div>

            <div class="form-section">
              <p class="summary-label">Endereço de entrega</p>
              <div class="field-row">
                <label class="field cep">
                  <span>CEP</span>
                  <input
                    v-model="address.postalCode"
                    type="text"
                    placeholder="00000-000"
                    maxlength="9"
                    @input="formatCep"
                  />
                </label>
                <button
                  type="button"
                  class="calc-btn"
                  @click="calculateShipping"
                  :disabled="loadingShipping"
                >{{ loadingShipping ? 'Calculando...' : 'Calcular frete' }}</button>
              </div>

              <div class="field-row">
                <label class="field grow">
                  <span>Rua</span>
                  <input
                    v-model="address.street"
                    type="text"
                  />
                </label>
                <label class="field">
                  <span>Número</span>
                  <input
                    v-model="address.number"
                    type="text"
                  />
                </label>
              </div>

              <div class="field-row">
                <label class="field">
                  <span>Complemento</span>
                  <input
                    v-model="address.complement"
                    type="text"
                  />
                </label>
                <label class="field">
                  <span>Bairro</span>
                  <input
                    v-model="address.district"
                    type="text"
                  />
                </label>
              </div>

              <div class="field-row">
                <label class="field grow">
                  <span>Cidade</span>
                  <input
                    v-model="address.city"
                    type="text"
                  />
                </label>
                <label class="field small">
                  <span>UF</span>
                  <input
                    v-model="address.state"
                    type="text"
                    maxlength="2"
                  />
                </label>
              </div>

              <p
                v-if="shippingError"
                class="error"
              >{{ shippingError }}</p>

              <div
                v-if="shippingOptions.length"
                class="shipping-options"
              >
                <label
                  v-for="option in shippingOptions"
                  :key="option.id"
                  class="shipping-option"
                  :class="{ selected: selectedShipping?.id === option.id }"
                >
                  <input
                    type="radio"
                    :value="option.id"
                    v-model="selectedShippingId"
                    @change="selectShipping(option)"
                  />
                  <span class="option-info">
                    <span class="option-name">{{ option.company }} · {{ option.name }}</span>
                    <span class="option-delivery">até {{ option.deliveryTime }} dias úteis</span>
                  </span>
                  <span class="option-price">{{ formatPrice(option.price) }}</span>
                </label>
              </div>
            </div>
          </template>

          <div class="totals">
            <div class="row"><span>Subtotal</span><span>{{ formatPrice(subtotal) }}</span></div>
            <div class="row">
              <span>Frete</span>
              <span>{{ selectedShipping ? formatPrice(selectedShipping.price) : 'a calcular' }}</span>
            </div>
            <div class="row total"><span>Total</span><span>{{ formatPrice(total) }}</span></div>
          </div>

          <p
            v-if="formError"
            class="error"
          >{{ formError }}</p>

          <button
            v-if="step === 'details'"
            type="button"
            class="cta full"
            :disabled="!selectedShipping || creatingOrder"
            @click="confirmOrder"
          >{{ creatingOrder ? 'Confirmando...' : 'Confirmar pedido' }}</button>

          <div
            v-if="step === 'details'"
            class="note"
          >
            <strong>Obrigada por apoiar a Marrooks.</strong>
          </div>
        </div>

        <div
          v-if="step === 'payment'"
          class="paycard"
        >
          <h2>Pagamento</h2>
          <div id="paymentBrick_container"></div>
          <p
            v-if="statusMessage"
            class="status"
          >{{ statusMessage }}</p>
          <p class="secure">Pagamento processado com segurança pelo Mercado Pago</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import { ApiError, ordersApi, paymentApi, shippingApi } from '../lib/api'

const { user } = useAuth()
const { items, subtotal, clear: clearCart } = useCart()

const step = ref('details')
const statusMessage = ref('')
const formError = ref('')
const shippingError = ref('')
const loadingShipping = ref(false)
const creatingOrder = ref(false)
const order = ref(null)

let paymentBrickController = null

const customer = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  phone: user.value?.phone ?? '',
  document: user.value?.document ?? '',
})

const address = reactive({
  postalCode: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
})

const shippingOptions = ref([])
const selectedShippingId = ref(null)
const selectedShipping = ref(null)

const total = computed(() => subtotal.value + (selectedShipping.value?.price ?? 0))

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatCep() {
  const digits = address.postalCode.replace(/\D/g, '').slice(0, 8)
  address.postalCode = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

async function calculateShipping() {
  shippingError.value = ''
  shippingOptions.value = []
  selectedShipping.value = null
  selectedShippingId.value = null

  const cleanCep = address.postalCode.replace(/\D/g, '')
  if (cleanCep.length !== 8) {
    shippingError.value = 'Digite um CEP válido (8 dígitos).'
    return
  }

  loadingShipping.value = true
  try {
    const data = await shippingApi.calculate({
      toPostalCode: cleanCep,
      items: items.value.map((item) => ({ slug: item.slug, quantity: item.quantity })),
    })

    if (!data.options || data.options.length === 0) {
      shippingError.value = 'Nenhuma opção de frete disponível para esse CEP.'
      return
    }

    shippingOptions.value = data.options
  } catch (err) {
    shippingError.value = err instanceof ApiError ? err.message : 'Não foi possível calcular o frete.'
  } finally {
    loadingShipping.value = false
  }
}

function selectShipping(option) {
  selectedShipping.value = option
}

async function confirmOrder() {
  formError.value = ''

  if (!customer.name || !customer.email) {
    formError.value = 'Preencha seu nome e e-mail.'
    return
  }
  if (!address.street || !address.number || !address.district || !address.city || !address.state) {
    formError.value = 'Preencha o endereço de entrega completo.'
    return
  }
  if (!selectedShipping.value) {
    formError.value = 'Selecione uma opção de frete.'
    return
  }

  creatingOrder.value = true
  try {
    const data = await ordersApi.create({
      items: items.value.map((item) => ({ slug: item.slug, quantity: item.quantity })),
      shipping: selectedShipping.value,
      customer: { ...customer },
      address: { ...address },
    })
    order.value = data.order
    step.value = 'payment'
    await nextTick()
    await mountPaymentBrick()
  } catch (err) {
    formError.value = err instanceof ApiError ? err.message : 'Não foi possível confirmar o pedido.'
  } finally {
    creatingOrder.value = false
  }
}

async function mountPaymentBrick() {
  const { publicKey } = await paymentApi.publicKey()
  const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
  const bricksBuilder = mp.bricks()

  paymentBrickController = await bricksBuilder.create('payment', 'paymentBrick_container', {
    initialization: {
      amount: order.value.total,
    },
    customization: {
      visual: {
        style: {
          theme: 'default',
          customVariables: {
            baseColor: '#B34D2B',
            formBackgroundColor: '#FFF8EF',
            borderRadiusSmall: '6px',
            borderRadiusMedium: '10px',
          },
        },
      },
      paymentMethods: {
        creditCard: 'all',
        debitCard: 'all',
        bankTransfer: 'all',
        minInstallments: 1,
        maxInstallments: 3,
      },
    },
    callbacks: {
      onReady: () => { },
      onSubmit: (formData, additionalData) => {
        return new Promise((resolve, reject) => {
          paymentApi
            .process({ orderReference: order.value.reference, formData, additionalData })
            .then((result) => {
              if (result.orderStatus === 'paid') {
                statusMessage.value = 'Pagamento aprovado! Seu pedido está a caminho.'
                clearCart()
                step.value = 'success'
              } else if (result.status === 'action_required') {
                statusMessage.value = 'Falta um passo (ex: Pix aguardando pagamento).'
              } else {
                statusMessage.value = 'Pagamento em processamento, aguarde a confirmação.'
              }
              resolve()
            })
            .catch((error) => {
              console.error('Erro ao processar pagamento:', error)
              statusMessage.value =
                error instanceof ApiError ? error.message : 'Erro ao processar pagamento, tente novamente.'
              reject()
            })
        })
      },
      onError: (error) => {
        console.error('Erro no Brick:', error)
      },
    },
  })
}
</script>

<style scoped>
.page {
  font-family: 'Karla', sans-serif;
  color: #512F18;
}

h1 {
  font-family: 'Fraunces', serif;
  font-weight: 500;
  font-size: 32px;
  line-height: 1.25;
  margin: 0 0 8px;
  max-width: 24ch;
}

.sub {
  font-size: 15px;
  color: #7A4E2B;
  margin: 0 0 24px;
}

.cta {
  display: inline-block;
  background: #B34D2B;
  color: #FCE0BD;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13.5px;
  border: none;
  cursor: pointer;
}

.cta.full {
  width: 100%;
  text-align: center;
  margin-top: 20px;
}

.cta:disabled {
  opacity: 0.6;
  cursor: default;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.summary-label {
  font-size: 13px;
  color: #8A5A32;
  margin: 0 0 14px;
  display: block;
}

.spine {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 10px 4px 4px 10px;
  margin-bottom: 10px;
  box-shadow: -4px 4px 0 rgba(81, 47, 24, 0.12);
  color: #FCE0BD;
}

.spine .title {
  font-family: 'Fraunces', serif;
  font-size: 15px;
  font-weight: 500;
}

.spine .qty {
  font-size: 13px;
  opacity: 0.75;
  margin-top: 2px;
}

.spine .price {
  font-family: 'Fraunces', serif;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

.spine.s1 {
  background: #B34D2B;
}

.spine.s2 {
  background: #C06E42;
}

.spine.s3 {
  background: #D86841;
}

.form-section {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1.5px dashed rgba(81, 47, 24, 0.3);
}

.field-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #7A4E2B;
}

.field.grow {
  flex: 2;
}

.field.small {
  flex: 0 0 70px;
}

.field.cep {
  flex: 1;
}

.field input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px solid rgba(81, 47, 24, 0.25);
  background: #fff;
  font-family: 'Karla', sans-serif;
  font-size: 14px;
  color: #512F18;
}

.calc-btn {
  align-self: flex-end;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #B34D2B;
  color: #FCE0BD;
  font-family: 'Karla', sans-serif;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  white-space: nowrap;
  height: 40px;
}

.calc-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.error {
  margin-top: 8px;
  font-size: 13px;
  color: #A33;
}

.shipping-options {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shipping-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid rgba(81, 47, 24, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13.5px;
}

.shipping-option.selected {
  border-color: #B34D2B;
  background: rgba(179, 77, 43, 0.06);
}

.option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.option-name {
  font-weight: 500;
}

.option-delivery {
  font-size: 12px;
  color: #8A5A32;
}

.option-price {
  font-family: 'Fraunces', serif;
  font-weight: 500;
}

.totals {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1.5px dashed rgba(81, 47, 24, 0.3);
}

.totals .row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
  color: #6B4525;
}

.totals .row.total {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 600;
  color: #512F18;
  margin-top: 14px;
}

.note {
  margin-top: 28px;
  padding: 16px 18px;
  background: rgba(179, 77, 43, 0.08);
  border-radius: 10px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #7A4A28;
  font-style: italic;
}

.note strong {
  font-style: normal;
  font-weight: 600;
}

.paycard {
  background: #fff8ef;
  border: 2px solid #512F18;
  border-radius: 14px;
  padding: 28px;
}

.paycard h2 {
  font-family: 'Fraunces', serif;
  font-weight: 500;
  font-size: 18px;
  margin: 0 0 20px;
}

.status {
  margin-top: 16px;
  font-size: 14px;
  color: #7A4A28;
}

.secure {
  text-align: center;
  font-size: 12px;
  color: #9A6B44;
  margin-top: 14px;
}
</style>