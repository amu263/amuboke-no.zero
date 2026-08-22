<script setup lang="ts">
// components/ui/IconWrapper.vue — 图标包装器
// AGENTS.md §5 #22: 内联 SVG，不依赖 icon font
// Usage: <IconWrapper size="md" color="accent"><svg ... /></IconWrapper>
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'accent' | 'error'
}>()
</script>

<template>
  <span
    :class="['icon-wrap', `icon-wrap--${size ?? 'md'}`, `icon-wrap--${color ?? 'default'}`]"
    aria-hidden="true"
  >
    <slot />
  </span>
</template>

<style scoped>
.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.icon-wrap svg {
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.icon-wrap--sm  { width: 1rem;  height: 1rem; }
.icon-wrap--md  { width: 1.25rem; height: 1.25rem; }
.icon-wrap--lg  { width: 1.6rem;  height: 1.6rem; }

.icon-wrap--default { color: var(--theme-on-surface); }
.icon-wrap--primary  { color: var(--theme-primary); }
.icon-wrap--accent   { color: var(--theme-accent); }
.icon-wrap--error    { color: var(--theme-error); }
</style>
