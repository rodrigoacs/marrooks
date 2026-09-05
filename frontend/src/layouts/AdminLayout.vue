<template>
  <div class="admin">
    <aside class="sidebar">
      <RouterLink
        to="/"
        class="brand"
      >
        <img
          src="/logo.png"
          alt="Marrooks"
        />
        <span>Marrooks admin</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink
          to="/admin/produtos"
          class="nav-link"
        >Produtos</RouterLink>
        <RouterLink
          to="/admin/pedidos"
          class="nav-link"
        >Pedidos</RouterLink>
      </nav>

      <div class="sidebar-footer">
        <RouterLink
          to="/"
          class="nav-link subtle"
        >Voltar para a loja</RouterLink>
        <button
          type="button"
          class="logout"
          @click="handleLogout"
        >Sair</button>
      </div>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<style scoped>
.admin {
  min-height: 100vh;
  display: flex;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-surface);
  border-right: 1.5px solid var(--color-border-soft);
  padding: var(--space-6) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text);
}

.brand img {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
}

.brand span {
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}

.nav-link.router-link-active {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border-top: 1.5px dashed var(--color-border-dashed);
  padding-top: var(--space-5);
}

.nav-link.subtle {
  padding: 0;
  font-size: var(--text-sm);
}

.logout {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-danger);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
}

.content {
  flex: 1;
  padding: var(--space-8) var(--space-9);
  max-width: 1100px;
}

@media (max-width: 720px) {
  .admin {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: var(--space-5);
  }

  .nav {
    flex-direction: row;
  }

  .sidebar-footer {
    border-top: none;
    padding-top: 0;
    flex-direction: row;
  }

  .content {
    padding: var(--space-6) var(--space-4);
  }
}
</style>