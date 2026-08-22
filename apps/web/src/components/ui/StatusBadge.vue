<script setup lang="ts">
// components/ui/StatusBadge.vue — 状态徽章
// Usage: <StatusBadge status="active">进行中</StatusBadge>
// AGENTS.md §5: 不引第三方脚本/UI库
defineProps<{
  status: 'active' | 'archived' | 'wip' | 'deprecated'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span
    :class="['status-badge', `status-badge--${status}`, `status-badge--${size ?? 'md'}`]"
  >
    <span class="status-badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  font-family: var(--theme-font-mono);
  font-weight: 600;
  border-radius: var(--theme-radius-pill);
  border: 1px solid;
  white-space: nowrap;
}

.status-badge--sm { font-size: 0.7rem; padding: 0.05em 0.5em; }
.status-badge--md { font-size: var(--theme-font-size-xs); padding: 0.1em 0.6em; }

.status-badge__dot {
  width: 0.45em;
  height: 0.45em;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.status-badge--active {
  color: var(--theme-success);
  border-color: var(--theme-success);
}
.status-badge--archived {
  color: var(--theme-secondary);
  border-color: var(--theme-border);
  opacity: 0.7;
}
.status-badge--wip {
  color: var(--theme-warning);
  border-color: var(--theme-warning);
}
.status-badge--deprecated {
  color: var(--theme-error);
  border-color: var(--theme-error);
}
</style>
