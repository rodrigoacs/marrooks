<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="tagline">Livrinhos que cabem na palma da mão, feitos com carinho.</p>
      <p class="copy">&copy; {{ year }} Marrooks</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 1.5px dashed var(--color-border-dashed);
  margin-top: var(--space-10);
}

.footer-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  color: var(--color-text-subtle);
  font-size: var(--text-sm);
}

.tagline {
  margin: 0;
  font-style: italic;
}

.copy {
  margin: 0;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}
</style>