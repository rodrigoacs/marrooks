<template>
  <div class="form-page">
    <h1>{{ isEditing ? 'Editar produto' : 'Novo produto' }}</h1>

    <p
      v-if="loading"
      class="state"
    >Carregando...</p>

    <form
      v-else
      class="form"
      @submit.prevent="handleSubmit"
    >
      <div class="field-row">
        <label class="field grow">
          <span>Nome</span>
          <input
            v-model="form.name"
            type="text"
            @input="syncSlug"
          />
        </label>
        <label class="field">
          <span>Slug</span>
          <input
            v-model="form.slug"
            type="text"
            @input="slugTouched = true"
          />
        </label>
      </div>

      <label class="field">
        <span>Descrição curta</span>
        <input
          v-model="form.shortDescription"
          type="text"
        />
      </label>

      <label class="field">
        <span>Descrição completa</span>
        <textarea
          v-model="form.description"
          rows="4"
        ></textarea>
      </label>

      <div class="field-row">
        <label class="field">
          <span>Preço (R$)</span>
          <input
            v-model="form.price"
            type="number"
            step="0.01"
            min="0"
          />
        </label>
        <label class="field">
          <span>Preço comparativo (R$)</span>
          <input
            v-model="form.comparePrice"
            type="number"
            step="0.01"
            min="0"
          />
        </label>
      </div>

      <label class="field">
        <span>Categoria</span>
        <select v-model="form.categoryId">
          <option :value="null">Sem categoria</option>
          <option
            v-for="category in categories"
            :key="category.slug"
            :value="category.id"
          >{{ category.name }}</option>
        </select>
      </label>

      <div class="field-row checkboxes">
        <label class="checkbox">
          <input
            v-model="form.active"
            type="checkbox"
          />
          <span>Ativo (visível na loja)</span>
        </label>
        <label class="checkbox">
          <input
            v-model="form.featured"
            type="checkbox"
          />
          <span>Destaque na home</span>
        </label>
      </div>

      <p class="section-label">Dimensões para frete (cm) e peso (kg)</p>
      <div class="field-row">
        <label class="field">
          <span>Largura</span>
          <input
            v-model="form.width"
            type="number"
            step="0.1"
            min="0.1"
          />
        </label>
        <label class="field">
          <span>Altura</span>
          <input
            v-model="form.height"
            type="number"
            step="0.1"
            min="0.1"
          />
        </label>
        <label class="field">
          <span>Comprimento</span>
          <input
            v-model="form.length"
            type="number"
            step="0.1"
            min="0.1"
          />
        </label>
        <label class="field">
          <span>Peso</span>
          <input
            v-model="form.weight"
            type="number"
            step="0.001"
            min="0.001"
          />
        </label>
      </div>

      <p class="section-label">Fotos do produto</p>
      <div class="images-list">
        <div
          v-for="(image, index) in form.images"
          :key="index"
          class="image-item"
        >
          <ImageUploadField
            :url="image.url"
            :alt="image.alt"
            @update:url="(value) => (image.url = value)"
            @update:alt="(value) => (image.alt = value)"
          />
          <button
            type="button"
            class="link-btn danger"
            @click="form.images.splice(index, 1)"
          >Remover esta foto</button>
        </div>
      </div>
      <button
        type="button"
        class="link-btn"
        @click="form.images.push({ url: '', alt: '' })"
      >{{ form.images.length === 0 ? '+ Adicionar foto' : '+ Adicionar outra foto' }}</button>

      <div
        v-if="isEditing"
        class="variants-callout"
      >
        <p class="section-label">Capas</p>
        <p class="muted">Cada capa (livro/série/autor) é gerenciada numa tela própria.</p>
        <RouterLink
          :to="`/admin/produtos/${id}/capas`"
          class="link-btn"
        >Gerenciar capas &rarr;</RouterLink>
      </div>

      <p
        v-if="formError"
        class="error"
      >{{ formError }}</p>

      <div class="actions">
        <button
          type="submit"
          class="cta"
          :disabled="saving"
        >{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        <RouterLink
          to="/admin/produtos"
          class="cancel"
        >Cancelar</RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminProductsApi, categoriesApi, ApiError } from '../../lib/api'
import ImageUploadField from '../../components/ImageUploadField.vue'

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
})

const router = useRouter()
const isEditing = Boolean(props.id)

const loading = ref(isEditing)
const saving = ref(false)
const formError = ref('')
const categories = ref([])
const slugTouched = ref(isEditing)

const form = reactive({
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  price: '',
  comparePrice: '',
  categoryId: null,
  active: true,
  featured: false,
  width: 11,
  height: 2,
  length: 16,
  weight: 0.05,
  images: [{ url: '', alt: '' }],
})

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function syncSlug() {
  if (!slugTouched.value) {
    form.slug = slugify(form.name)
  }
}

function buildPayload() {
  return {
    name: form.name,
    slug: form.slug,
    shortDescription: form.shortDescription,
    description: form.description,
    price: form.price,
    comparePrice: form.comparePrice === '' ? null : form.comparePrice,
    categoryId: form.categoryId,
    active: form.active,
    featured: form.featured,
    width: form.width,
    height: form.height,
    length: form.length,
    weight: form.weight,
    images: form.images.filter((image) => image.url.trim()),
  }
}

async function handleSubmit() {
  formError.value = ''
  saving.value = true
  try {
    if (isEditing) {
      await adminProductsApi.update(props.id, buildPayload())
    } else {
      await adminProductsApi.create(buildPayload())
    }
    router.push('/admin/produtos')
  } catch (err) {
    formError.value = err instanceof ApiError ? err.message : 'Não foi possível salvar o produto.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const data = await categoriesApi.list()
    categories.value = data.categories
  } catch {
    categories.value = []
  }

  if (isEditing) {
    try {
      const data = await adminProductsApi.get(props.id)
      const product = data.product
      form.name = product.name
      form.slug = product.slug
      form.shortDescription = product.shortDescription ?? ''
      form.description = product.description ?? ''
      form.price = product.price
      form.comparePrice = product.comparePrice ?? ''
      form.categoryId = product.categoryId
      form.active = product.active
      form.featured = product.featured
      form.width = product.dimensions.width
      form.height = product.dimensions.height
      form.length = product.dimensions.length
      form.weight = product.dimensions.weight
      form.images = product.images.length ? product.images.map((img) => ({ ...img })) : [{ url: '', alt: '' }]
    } catch (err) {
      formError.value = err instanceof ApiError ? err.message : 'Não foi possível carregar o produto.'
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.form-page {
  max-width: 640px;
}

h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-6);
}

.state {
  color: var(--color-text-muted);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.field-row>* {
  min-width: 140px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.field.grow {
  flex: 2;
}

.field input,
.field select,
.field textarea {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: 16px;
  min-height: 44px;
  color: var(--color-text);
}

.field textarea {
  resize: vertical;
  min-height: 96px;
}

.checkboxes {
  align-items: center;
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

.section-label {
  font-size: var(--text-sm);
  color: var(--color-brown-600);
  margin: var(--space-2) 0 0;
  padding-top: var(--space-3);
  border-top: 1.5px dashed var(--color-border-dashed);
}

.images-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.image-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-soft);
}

.image-item:last-child {
  border-bottom: none;
}

.variants-callout {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.variants-callout .section-label {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.variants-callout .muted {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin: 0 0 var(--space-2);
}

.link-btn {
  align-self: flex-start;
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
  align-self: center;
}

.error {
  color: var(--color-danger);
  font-size: var(--text-sm);
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-top: var(--space-3);
}

.cta {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  min-height: 44px;
  cursor: pointer;
}

.cta:disabled {
  opacity: 0.6;
  cursor: default;
}

.cancel {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
</style>