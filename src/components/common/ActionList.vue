<template>
  <div class="action-column">
    <h4 class="column-title" :class="`tone-${tone}`">{{ title }}</h4>
    <div class="action-list">
      <div v-for="(item, idx) in items" :key="idx" class="action-item">
        <span class="action-chip" :class="`chip-${tone}`">{{ item.chip }}</span>
        <div class="action-info">
          <strong class="action-title">{{ item.title }}</strong>
          <span class="action-note">{{ item.note }}</span>
        </div>
        <button class="action-btn" @click="$emit('action-click', item)">상세</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  tone: { type: String, default: 'warn' }, // bad, warn, ok
  items: { type: Array, default: () => [] }
})

defineEmits(['action-click'])
</script>

<style scoped>
.action-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.column-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.column-title.tone-bad {
  color: var(--error);
}

.column-title.tone-warn {
  color: #f59e0b;
}

.column-title.tone-ok {
  color: var(--success);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.action-item:hover {
  box-shadow: var(--shadow-sm);
}

.action-chip {
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  flex-shrink: 0;
}

.chip-bad {
  background: #fee2e2;
  color: #991b1b;
}

.chip-warn {
  background: #fef3c7;
  color: #92400e;
}

.chip-ok {
  background: #dcfce7;
  color: #166534;
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.action-title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.action-note {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
}

.action-btn {
  padding: var(--space-1) var(--space-3);
  background: var(--surface-hover);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.action-btn:hover {
  background: var(--lina-yellow);
  border-color: var(--lina-yellow);
}
</style>
