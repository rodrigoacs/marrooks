<template>
  <div
    class="bar"
    role="note"
  >
    <Transition
      name="msg-fade"
      mode="out-in"
    >
      <span
        :key="currentIndex"
        class="msg"
      >{{ messages[currentIndex] }}</span>
    </Transition>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const messages = [
  'Compra 100% segura via Mercado Pago',
  'Feito à mão, com carinho',
  'Envio para todo o Brasil',
]

const ROTATE_INTERVAL_MS = 4000

const currentIndex = ref(0)
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % messages.length
  }, ROTATE_INTERVAL_MS)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.bar {
  position: sticky;
  top: 0;
  z-index: 11;
  height: var(--announcement-height);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brown-900);
  color: var(--color-cream-100);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  padding: 0 var(--space-4);
  text-align: center;
}

.msg {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.msg-fade-enter-active,
.msg-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.msg-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.msg-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {

  .msg-fade-enter-active,
  .msg-fade-leave-active {
    transition: none;
  }

  .msg-fade-enter-from,
  .msg-fade-leave-to {
    transform: none;
  }
}
</style>