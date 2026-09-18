<template>
  <div class="admin">
    <aside class="sidebar">
      <div class="topbar-row">
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

        <button
          type="button"
          class="logout logout-mobile"
          @click="handleLogout"
        >Sair</button>
      </div>

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
          class="logout logout-desktop"
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
  background: #ffffff;
  --color-bg: #ffffff;
  --color-surface: #f4f4f5;
  --color-surface-solid: #ffffff;

  --color-text: #18181b;
  --color-text-muted: #52525b;
  --color-text-subtle: #71717a;
  --color-brown-500: #a1a1aa;
  --color-brown-600: #71717a;
  --color-brown-700: #52525b;
  --color-brown-800: #3f3f46;
  --color-brown-900: #18181b;

  --color-border: rgba(0, 0, 0, 0.14);
  --color-border-soft: rgba(0, 0, 0, 0.09);
  --color-border-dashed: rgba(0, 0, 0, 0.18);

  --color-primary: #2563eb;
  --color-primary-contrast: #ffffff;
  --color-coral-500: #2563eb;

  --color-danger: #dc2626;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-info: #2563eb;
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

.topbar-row {
  display: none;
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
  min-height: 44px;
  display: flex;
  align-items: center;
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
  min-height: auto;
}

.logout {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-danger);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  min-height: 44px;
  cursor: pointer;
}

.logout-mobile {
  display: none;
}

.content {
  flex: 1;
  padding: var(--space-8) var(--space-9);
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 720px) {
  .admin {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
    padding: var(--space-4);
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .topbar-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logout-mobile {
    display: inline-flex;
    align-items: center;
  }

  .logout-desktop {
    display: none;
  }

  .nav {
    flex-direction: row;
    gap: var(--space-2);
  }

  .nav-link {
    flex: 1;
    justify-content: center;
    text-align: center;
    background: var(--color-surface);
  }

  .nav-link.router-link-active {
    background: var(--color-primary);
  }

  .sidebar-footer {
    display: none;
  }

  .content {
    padding: var(--space-5) var(--space-4);
  }
}
</style>