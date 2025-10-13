<template>
  <div class="chart-wrapper" :class="{ loading: isLoading, error: hasError }">
    <div v-if="title" class="chart-header">
      <h4 class="chart-title">{{ title }}</h4>
      <div v-if="$slots.actions" class="chart-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="chart-body" :style="{ height: height }">
      <!-- Loading State -->
      <div v-if="isLoading" class="chart-loading">
        <div class="loading-spinner"></div>
        <span>차트 로딩 중...</span>
      </div>
      
      <!-- Error State -->
      <div v-else-if="hasError" class="chart-error">
        <IconSystem name="alert-circle" :size="32" />
        <span>{{ errorMessage || '차트를 불러올 수 없습니다' }}</span>
      </div>
      
      <!-- Chart Content -->
      <div v-else class="chart-content">
        <slot></slot>
      </div>
    </div>
    
    <div v-if="$slots.footer || description" class="chart-footer">
      <slot name="footer">
        <span v-if="description" class="chart-description">{{ description }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import IconSystem from '../IconSystem.vue'

defineProps({
  title: String,
  description: String,
  height: { type: String, default: '300px' },
  isLoading: { type: Boolean, default: false },
  hasError: { type: Boolean, default: false },
  errorMessage: String
})
</script>

<style scoped>
.chart-wrapper {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: var(--transition-fast);
}

.chart-wrapper:hover {
  box-shadow: var(--shadow-sm);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.chart-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.chart-actions {
  display: flex;
  gap: var(--space-2);
}

.chart-body {
  position: relative;
  padding: var(--space-4);
}

.chart-content {
  width: 100%;
  height: 100%;
}

.chart-loading,
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-3);
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--lina-yellow);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.chart-error {
  color: var(--error);
}

.chart-footer {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.chart-description {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
}

/* States */
.chart-wrapper.loading {
  pointer-events: none;
}

.chart-wrapper.error {
  border-color: var(--error);
}
</style>
