<template>
  <div>
    <RouterLink
      to="/admin/produtos"
      class="back"
    >&larr; Produtos</RouterLink>

    <h1>Variações{{ productName ? ` — ${productName}` : '' }}</h1>
    <p class="sub">
      {{ isBookProduct
        ? 'Cada variação é um livro (série, título e autor) que aparece como opção na página do produto.'
        : 'Cada variação aparece como opção pra escolher na página do produto.' }}
    </p>

    <div class="add-form">
      <p class="section-label">Nova variação</p>

      <ImageUploadField
        :url="newVariant.imageUrl"
        :alt="newVariant.imageAlt"
        :show-alt="false"
        @update:url="(value) => (newVariant.imageUrl = value)"
        @update:alt="(value) => (newVariant.imageAlt = value)"
      />

      <label class="field">
        <span>{{ isBookProduct ? 'Livro' : 'Nome da variação' }}</span>
        <input
          v-model="newVariant.name"
          type="text"
          @input="syncSlug(newVariant)"
        />
      </label>

      <div
        v-if="isBookProduct"
        class="field-row"
      >
        <label class="field">
          <span>Série (opcional)</span>
          <input
            v-model="newVariant.series"
            type="text"
          />
        </label>
        <label class="field">
          <span>Autor</span>
          <input
            v-model="newVariant.author"
            type="text"
          />
        </label>
      </div>

      <details class="advanced">
        <summary>Slug (avançado)</summary>
        <label class="field">
          <span>Slug</span>
          <input
            v-model="newVariant.slug"
            type="text"
            @input="newVariant.slugTouched = true"
          />
        </label>
      </details>

      <p
        v-if="addError"
        class="error"
      >{{ addError }}</p>
      <button
        type="button"
        class="cta"
        :disabled="adding"
        @click="handleAdd"
      >{{ adding ? 'Adicionando...' : 'Adicionar variação' }}</button>
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
      v-else-if="variants.length === 0"
      class="state"
    >Nenhuma variação cadastrada ainda.</p>

    <ul
      v-else
      class="variant-list"
    >
      <li
        v-for="variant in variants"
        :key="variant.id"
        class="variant-card"
      >
        <template v-if="editingId !== variant.id">
          <img
            v-if="variant.image?.url"
            :src="variant.image.url"
            :alt="variant.name"
            class="thumb"
          />
          <div
            v-else
            class="thumb thumb-fallback"
          >{{ variant.name.charAt(0) }}</div>

          <div class="variant-info">
            <p class="variant-title">{{ variant.name }}</p>
            <p
              v-if="variant.author || variant.series"
              class="variant-meta"
            >
              {{ variant.author }}<template v-if="variant.author && variant.series"> · </template>{{ variant.series }}
            </p>
            <span
              class="badge"
              :class="variant.active ? 'active' : 'inactive'"
            >{{ variant.active ? 'Ativa' : 'Inativa' }}</span>
          </div>

          <div class="variant-actions">
            <button
              type="button"
              class="link-btn"
              @click="startEdit(variant)"
            >Editar</button>
            <button
              v-if="variant.active"
              type="button"
              class="link-btn danger"
              @click="handleDeactivate(variant)"
            >Desativar</button>
          </div>
        </template>

        <div
          v-else
          class="edit-form"
        >
          <ImageUploadField
            :url="editForm.imageUrl"
            :alt="editForm.imageAlt"
            :show-alt="false"
            @update:url="(value) => (editForm.imageUrl = value)"
            @update:alt="(value) => (editForm.imageAlt = value)"
          />

          <label class="field">
            <span>{{ isBookProduct ? 'Livro' : 'Nome da variação' }}</span>
            <input
              v-model="editForm.name"
              type="text"
            />
          </label>

          <div
            v-if="isBookProduct"
            class="field-row"
          >
            <label class="field">
              <span>Série</span>
              <input
                v-model="editForm.series"
                type="text"
              />
            </label>
            <label class="field">
              <span>Autor</span>
              <input
                v-model="editForm.author"
                type="text"
              />
            </label>
          </div>

          <details class="advanced">
            <summary>Slug (avançado)</summary>
            <label class="field">
              <span>Slug</span>
              <input
                v-model="editForm.slug"
                type="text"
              />
            </label>
          </details>

          <label class="checkbox">
            <input
              v-model="editForm.active"
              type="checkbox"
            />
            <span>Ativa</span>
          </label>

          <p
            v-if="editError"
            class="error"
          >{{ editError }}</p>

          <div class="edit-actions">
            <button
              type="button"
              class="cta"
              :disabled="saving"
              @click="saveEdit(variant.id)"
            >{{ saving ? 'Salvando...' :
              'Salvar' }}</button>
            <button
              type="button"
              class="link-btn"
              @click="editingId = null"
            >Cancelar</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { adminProductsApi, adminVariantsApi, ApiError } from '../../lib/api'
import ImageUploadField from '../../components/ImageUploadField.vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const productName = ref('')
const variantKind = ref('simple')
const variants = ref([])
const loading = ref(true)
const error = ref('')

const isBookProduct = computed(() => variantKind.value === 'book')

const adding = ref(false)
const addError = ref('')

const editingId = ref(null)
const editForm = reactive({})
const saving = ref(false)
const editError = ref('')

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function blankVariant() {
  return {
    name: '',
    slug: '',
    slugTouched: false,
    series: '',
    author: '',
    imageUrl: '',
    imageAlt: '',
  }
}

const newVariant = reactive(blankVariant())

function syncSlug(target) {
  if (!target.slugTouched) {
    target.slug = slugify(target.name)
  }
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [productData, variantsData] = await Promise.all([
      adminProductsApi.get(props.id),
      adminVariantsApi.list(props.id),
    ])
    productName.value = productData.product.name
    variantKind.value = productData.product.variantKind
    variants.value = variantsData.variants
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Não foi possível carregar as variações.'
  } finally {
    loading.value = false
  }
}

async function handleAdd() {
  addError.value = ''

  if (!newVariant.name.trim()) {
    addError.value = isBookProduct.value ? 'Informe o título do livro.' : 'Informe o nome da variação.'
    return
  }
  if (isBookProduct.value && !newVariant.author.trim()) {
    addError.value = 'Informe o autor.'
    return
  }

  adding.value = true
  try {
    const data = await adminVariantsApi.create(props.id, {
      slug: newVariant.slug || slugify(newVariant.name),
      series: isBookProduct.value ? newVariant.series || null : null,
      name: newVariant.name,
      author: isBookProduct.value ? newVariant.author || null : null,
      imageUrl: newVariant.imageUrl || null,
      imageAlt: newVariant.imageAlt || null,
    })
    variants.value.push(data.variant)
    Object.assign(newVariant, blankVariant())
  } catch (err) {
    addError.value = err instanceof ApiError ? err.message : 'Não foi possível adicionar a variação.'
  } finally {
    adding.value = false
  }
}

function startEdit(variant) {
  editingId.value = variant.id
  editError.value = ''
  Object.assign(editForm, {
    name: variant.name,
    slug: variant.slug,
    series: variant.series ?? '',
    author: variant.author ?? '',
    imageUrl: variant.image?.url ?? '',
    imageAlt: variant.image?.alt ?? '',
    active: variant.active,
  })
}

async function saveEdit(variantId) {
  editError.value = ''
  saving.value = true
  try {
    const data = await adminVariantsApi.update(props.id, variantId, {
      slug: editForm.slug,
      series: isBookProduct.value ? editForm.series || null : null,
      name: editForm.name,
      author: isBookProduct.value ? editForm.author || null : null,
      imageUrl: editForm.imageUrl || null,
      imageAlt: editForm.imageAlt || null,
      active: editForm.active,
    })
    const index = variants.value.findIndex((v) => v.id === variantId)
    if (index !== -1) variants.value[index] = data.variant
    editingId.value = null
  } catch (err) {
    editError.value = err instanceof ApiError ? err.message : 'Não foi possível salvar a variação.'
  } finally {
    saving.value = false
  }
}

async function handleDeactivate(variant) {
  if (!confirm(`Desativar a variação "${variant.name}"?`)) return
  try {
    await adminVariantsApi.remove(props.id, variant.id)
    variant.active = false
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'Não foi possível desativar a variação.')
  }
}

onMounted(loadData)
</script>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-bottom: var(--space-3);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  text-decoration: none;
}

h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-2);
}

.sub {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin: 0 0 var(--space-6);
}

.add-form {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  margin-bottom: var(--space-7);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-label {
  font-size: var(--text-sm);
  color: var(--color-brown-600);
  margin: 0;
}

.field-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.field-row>* {
  min-width: 140px;
}

@media (max-width: 480px) {
  .field-row {
    flex-direction: column;
  }

  .field-row>* {
    min-width: 100%;
  }
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.field input {
  min-height: 44px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text);
}

.advanced {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.advanced summary {
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
  color: var(--color-brown-600);
  font-weight: var(--weight-medium);
}

.advanced .field {
  margin-top: var(--space-2);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text);
  min-height: 44px;
}

.checkbox input {
  width: 20px;
  height: 20px;
}

.error {
  color: var(--color-danger);
  font-size: var(--text-sm);
  margin: 0;
}

.state {
  color: var(--color-text-muted);
}

.state.error {
  color: var(--color-danger);
}

.cta {
  align-self: flex-start;
  min-height: 44px;
  padding: 0 var(--space-5);
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

.variant-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.variant-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-solid);
  flex-wrap: wrap;
}

.thumb {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.thumb-fallback {
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  color: var(--color-brown-500);
}

.variant-info {
  flex: 1;
  min-width: 160px;
}

.variant-title {
  font-weight: var(--weight-medium);
  margin: 0;
  font-size: var(--text-sm);
}

.variant-meta {
  margin: 2px 0 var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-brown-600);
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}

.badge.active {
  background: rgba(179, 77, 43, 0.12);
  color: var(--color-primary);
}

.badge.inactive {
  background: rgba(81, 47, 24, 0.1);
  color: var(--color-brown-600);
}

.variant-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-end;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  cursor: pointer;
}

.link-btn.danger {
  color: var(--color-danger);
}

.edit-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-2);
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}
</style>