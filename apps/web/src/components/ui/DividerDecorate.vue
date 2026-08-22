<script setup lang="ts">
// components/ui/DividerDecorate.vue — 装饰分割线
// Usage: <DividerDecorate />
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="divider-decorate" role="separator" :aria-label="label">
    <span v-if="label" class="divider-decorate__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.divider-decorate {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: var(--theme-spacing-xl) 0;
  color: var(--theme-border);
}
.divider-decorate::before,
.divider-decorate::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--theme-border);
}
.divider-decorate__label {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-secondary);
  opacity: 0.6;
  white-space: nowrap;
  letter-spacing: 0.05em;
}
</style>
