<template>
  <div>
    <p class="summary-label">Sua pilha</p>
    <h1>Carrinho</h1>

    <p
      v-if="items.length === 0"
      class="empty"
    >
      Seu carrinho está vazio.
      <RouterLink to="/catalogo">Ver catálogo</RouterLink>
    </p>

    <div
      v-else
      class="content"
    >
      <TransitionGroup
        name="cart-item"
        tag="ul"
        class="items"
        :css="false"
        @enter="onEnter"
        @leave="onLeave"
      >
        <li
          v-for="(item, i) in items"
          :key="item.key"
          class="item"
          :class="`s${(i % 3) + 1}`"
        >
          <RouterLink
            :to="`/produto/${item.productSlug}`"
            class="name"
          >
            {{ item.name }}
            <span
              v-if="item.author"
              class="author"
            >{{ item.author }}</span>
          </RouterLink>

          <div class="qty-row">
            <button
              type="button"
              @click="updateQuantity(item.key, item.quantity - 1)"
            >-</button>
            <span>{{ item.quantity }}</span>
            <button
              type="button"
              @click="updateQuantity(item.key, item.quantity + 1)"
            >+</button>
          </div>

          <span class="price">{{ formatPrice(item.price * item.quantity) }}</span>

          <button
            type="button"
            class="remove"
            aria-label="Remover"
            @click="removeItem(item.key)"
          >&times;</button>
        </li>
      </TransitionGroup>

      <div class="totals">
        <div class="row total">
          <span>Subtotal</span>
          <span>{{ formatPrice(subtotal) }}</span>
        </div>
      </div>

      <RouterLink
        to="/checkout"
        class="cta"
      >Ir para o checkout</RouterLink>
    </div>
  </div>
</template>

<script setup>
import gsap from 'gsap'
import { useCart } from '../composables/useCart'

const { items, subtotal, updateQuantity, removeItem } = useCart()

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function onEnter(el, done) {
  gsap.from(el, {
    opacity: 0,
    x: -24,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: done,
  })
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    x: -24,
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 0,
    overflow: 'hidden',
    duration: 0.32,
    ease: 'power2.in',
    onComplete: done,
  })
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
  margin-bottom: var(--space-6);
}

.empty {
  color: var(--color-text-muted);
}

.empty a {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

.content {
  max-width: 560px;
}

.items {
  list-style: none;
  margin: 0 0 var(--space-6);
  padding: 0;
  position: relative;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-spine);
  margin-bottom: var(--space-2);
  box-shadow: var(--shadow-spine);
  color: var(--color-cream-100);
}

.cart-item-move {
  transition: transform 0.3s ease;
}

.item.s1 {
  background: var(--color-spine-1);
}

.item.s2 {
  background: var(--color-spine-2);
}

.item.s3 {
  background: var(--color-spine-3);
}

.name {
  flex: 1;
  min-width: 0;
  color: inherit;
  text-decoration: none;
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  display: flex;
  flex-direction: column;
}

.author {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-regular);
  opacity: 0.8;
}

.qty-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-md);
  padding: 2px var(--space-2);
}

.qty-row button {
  border: none;
  background: none;
  color: inherit;
  font-size: var(--text-md);
  cursor: pointer;
  width: 18px;
  border-radius: 4px;
  transition: background-color 0.12s ease, transform 0.1s ease;
}

.qty-row button:hover {
  background: rgba(0, 0, 0, 0.15);
}

.qty-row button:active {
  transform: scale(0.85);
}

.price {
  font-family: var(--font-display);
  font-size: var(--text-md);
  white-space: nowrap;
}

.remove {
  border: none;
  background: none;
  color: inherit;
  font-size: var(--text-lg);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.remove:hover {
  opacity: 1;
  transform: scale(1.15);
}

.remove:active {
  transform: scale(0.9);
}

.totals {
  padding-top: var(--space-5);
  border-top: 1.5px dashed var(--color-border-dashed);
  margin-bottom: var(--space-6);
}

.totals .row {
  display: flex;
  justify-content: space-between;
}

.totals .row.total {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
}

.cta {
  display: inline-block;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  text-decoration: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-spine);
}

.cta:active {
  transform: translateY(0) scale(0.98);
}
</style>