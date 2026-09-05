<template>
  <div class="auth-page">
    <p class="summary-label">Entrar</p>
    <h1>Acesse sua conta Marrooks</h1>

    <form
      class="form"
      @submit.prevent="handleSubmit"
    >
      <label class="field">
        <span>E-mail</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
        />
      </label>

      <label class="field">
        <span>Senha</span>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
      </label>

      <p
        v-if="error"
        class="error"
      >{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
      >{{ loading ? 'Entrando...' : 'Entrar' }}</button>
    </form>

    <p class="switch">
      Ainda não tem conta?
      <RouterLink to="/cadastro">Cadastre-se</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { ApiError } from '../lib/api'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const { login } = useAuth()
const router = useRouter()
const route = useRoute()

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login({ email: email.value, password: password.value })
    router.push(route.query.redirect?.toString() ?? '/conta')
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  max-width: 380px;
}

.summary-label {
  font-size: var(--text-sm);
  color: var(--color-brown-600);
  margin: 0 0 var(--space-3);
}

h1 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-7);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.field input {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
}

.error {
  color: var(--color-danger);
  font-size: var(--text-sm);
  margin: 0;
}

button {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: default;
}

.switch {
  margin-top: var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.switch a {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}
</style>