<template>
  <div>
    <p class="summary-label">404</p>
    <h1>Essa página não existe.</h1>
    <RouterLink
      to="/"
      class="back"
    >Voltar para a loja</RouterLink>
  </div>
</template>

<script setup></script>

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

.back {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  text-decoration: none;
}
</style>