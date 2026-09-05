<template>
  <div class="admin-page">
    <p class="summary-label">Admin</p>
    <h1>Painel administrativo</h1>
    <p class="placeholder">
      Cadastro de produtos, estoque e pedidos entram na Fase 5. O middleware
      <code>requireAdmin</code> já protege esta área no backend.
    </p>
    <RouterLink
      to="/"
      class="back"
    >Voltar para a loja</RouterLink>
  </div>
</template>

<script setup></script>

<style scoped>
.admin-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-9) var(--space-6);
}

.summary-label {
  font-size: var(--text-sm);
  color: var(--color-brown-600);
  margin: 0 0 var(--space-3);
}

h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
}

.placeholder {
  color: var(--color-text-muted);
}

code {
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
  font-size: 0.9em;
}

.back {
  display: inline-block;
  margin-top: var(--space-6);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  text-decoration: none;
}
</style>