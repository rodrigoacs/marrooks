<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink
        to="/"
        class="brand"
      >
        <img
          src="/logo.png"
          alt="Marrooks"
        />
        <span>Marrooks</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink
          to="/catalogo"
          class="nav-link"
        >Catálogo</RouterLink>
        <RouterLink
          v-if="isAuthenticated"
          to="/conta"
          class="nav-link"
        >Minha conta</RouterLink>
        <RouterLink
          v-else
          to="/entrar"
          class="nav-link"
        >Entrar</RouterLink>
      </nav>

      <RouterLink
        to="/carrinho"
        class="cart-link"
        aria-label="Ver carrinho"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4H5L5.4 6M5.4 6H20L18 13H7M5.4 6L7 13M7 13L5.6 15.6C5.2 16.3 5.7 17.2 6.5 17.2H18M9.5 21C10.3 21 11 20.3 11 19.5C11 18.7 10.3 18 9.5 18C8.7 18 8 18.7 8 19.5C8 20.3 8.7 21 9.5 21ZM18 21C18.8 21 19.5 20.3 19.5 19.5C19.5 18.7 18.8 18 18 18C17.2 18 16.5 18.7 16.5 19.5C16.5 20.3 17.2 21 18 21Z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span
          v-if="itemCount > 0"
          class="cart-count"
        >{{ itemCount }}</span>
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'

const { isAuthenticated } = useAuth()
const { itemCount } = useCart()
</script>

<style scoped>
.header {
  border-bottom: 1.5px solid var(--color-border-soft);
  background: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  max-width: var(--content-max-width);
  height: var(--header-height);
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text);
}

.brand img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
}

.brand span {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
}

.nav-link.router-link-active {
  color: var(--color-primary);
}

.cart-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  text-decoration: none;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -10px;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

@media (max-width: 600px) {
  .header-inner {
    padding: 0 var(--space-4);
  }

  .brand span {
    display: none;
  }
}
</style>