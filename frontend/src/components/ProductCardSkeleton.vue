<template>
  <div
    class="card"
    aria-hidden="true"
  >
    <div class="image-wrap shimmer" />
    <div class="info">
      <div class="line category shimmer" />
      <div class="line name shimmer" />
      <div class="line price shimmer" />
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.card {
  padding: var(--space-4);
  border: 2px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
}

.image-wrap {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.line {
  border-radius: var(--radius-sm);
}

.line.category {
  width: 40%;
  height: 11px;
}

.line.name {
  width: 80%;
  height: 15px;
}

.line.price {
  width: 55%;
  height: 15px;
  margin-top: 2px;
}

.shimmer {
  background: linear-gradient(100deg,
      var(--color-border-soft) 30%,
      var(--color-border) 50%,
      var(--color-border-soft) 70%);
  background-size: 200% 100%;
  animation: shimmer-sweep 1.4s ease-in-out infinite;
}

@keyframes shimmer-sweep {
  from {
    background-position: 150% 0;
  }

  to {
    background-position: -50% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
    background: var(--color-border-soft);
  }
}
</style>