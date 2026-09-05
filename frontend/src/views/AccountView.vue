<template>
  <div>
    <p class="summary-label">Minha conta</p>
    <h1>Olá, {{ user?.name }}</h1>
    <p class="email">{{ user?.email }}</p>

    <p class="placeholder">
      Histórico de pedidos e edição de dados entram em fases futuras.
    </p>

    <button
      class="logout"
      @click="handleLogout"
    >Sair</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<style scoped>
.summary-label {
  font-size: var(--text-sm);
  color: var(--color-brown-600);
  margin: 0 0 var(--space-3);
}

h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-2);
}

.email {
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6);
}

.placeholder {
  color: var(--color-text-muted);
  margin-bottom: var(--space-7);
}

.logout {
  padding: var(--space-3) var(--space-6);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
}
</style>