<template>
  <section class="fold-section" :class="{ open: isOpen }">
    <div class="fold-header" @click="toggle">
      <span class="fold-icon">▶</span>
      <h3 class="fold-title">{{ title }}</h3>
      <span v-if="subtitle" class="fold-subtitle">{{ subtitle }}</span>
    </div>
    <div v-show="isOpen" class="fold-content">
      <slot></slot>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: String,
  subtitle: String,
  defaultOpen: { type: Boolean, default: true }
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.fold-section {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.fold-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  cursor: pointer;
  user-select: none;
  transition: var(--transition-fast);
  border-bottom: 1px solid var(--border-primary);
}

.fold-header:hover {
  background: var(--surface-hover);
}

.fold-icon {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.fold-section.open .fold-icon {
  transform: rotate(90deg);
}

.fold-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin: 0;
}

.fold-subtitle {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
  margin-left: auto;
}

.fold-content {
  padding: var(--space-4);
}
</style>
