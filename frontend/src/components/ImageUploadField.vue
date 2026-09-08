<template>
  <div class="upload-field">
    <div
      v-if="url"
      class="preview"
    >
      <img
        :src="url"
        :alt="alt || 'Imagem'"
      />
      <div class="preview-actions">
        <button
          type="button"
          class="btn"
          :disabled="uploading"
          @click="triggerPick"
        >{{ uploading ? 'Enviando...' : 'Trocar foto' }}</button>
        <button
          type="button"
          class="btn danger"
          :disabled="uploading"
          @click="handleRemove"
        >Remover</button>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="dropzone"
      :disabled="uploading"
      @click="triggerPick"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M7 9l5-5 5 5M12 4v13"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ uploading ? 'Enviando...' : 'Adicionar foto' }}</span>
      <span class="hint">Toque para tirar uma foto ou escolher da galeria</span>
    </button>

    <label
      v-if="showAlt && url"
      class="alt-field"
    >
      <span>Descrição da foto (opcional)</span>
      <input
        :value="alt"
        type="text"
        placeholder="ex: capa do livro Corte de Espinhos e Rosas"
        @input="$emit('update:alt', $event.target.value)"
      />
    </label>

    <p
      v-if="error"
      class="error"
    >{{ error }}</p>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden-input"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { adminUploadsApi, ApiError } from '../lib/api'

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  showAlt: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:url', 'update:alt'])

const fileInput = ref(null)
const uploading = ref(false)
const error = ref('')

function triggerPick() {
  fileInput.value?.click()
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  error.value = ''
  uploading.value = true
  try {
    const data = await adminUploadsApi.upload(file)
    emit('update:url', data.url)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Não foi possível enviar a imagem.'
  } finally {
    uploading.value = false
  }
}

function handleRemove() {
  emit('update:url', '')
  emit('update:alt', '')
}
</script>

<style scoped>
.upload-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-height: 120px;
  padding: var(--space-5);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
}

.dropzone:disabled {
  opacity: 0.6;
  cursor: default;
}

.dropzone .hint {
  font-weight: var(--weight-regular);
  font-size: var(--text-xs);
  color: var(--color-brown-500);
}

.preview {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.preview img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border-soft);
  flex-shrink: 0;
}

.preview-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.btn {
  min-height: 44px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
}

.btn.danger {
  color: var(--color-danger);
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.alt-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.alt-field input {
  min-height: 44px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text);
}

.error {
  color: var(--color-danger);
  font-size: var(--text-sm);
  margin: 0;
}
</style>