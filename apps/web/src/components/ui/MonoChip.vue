<script setup lang="ts">
// components/ui/MonoChip.vue — 等宽标签 chip
// Usage: <MonoChip>#typescript</MonoChip>
defineProps<{
  tag?: string
  accent?: boolean
}>()
</script>

<template>
  <span :class="['mono-chip', { 'mono-chip--accent': accent }]">
    <slot>{{ tag }}</slot>
  </span>
</template>

<style scoped>
.mono-chip {
  display: inline-flex;
  align-items: center;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  padding: 0.1em 0.5em;
  border-radius: var(--theme-radius-sm);
  background: var(--theme-scrim);
  color: var(--theme-secondary);
  border: 1px solid var(--theme-border);
  line-height: 1.6;
  white-space: nowrap;
}

.mono-chip--accent {
  color: var(--theme-accent);
  border-color: var(--theme-accent);
  background: var(--theme-scrim);
}
</style>
