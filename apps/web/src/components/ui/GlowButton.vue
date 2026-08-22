<script setup lang="ts">
// components/ui/GlowButton.vue — 极客风发光按钮
// AGENTS.md §5 #8: 主强调用 flat/elevated，次强调用 tonal，低强调用 text
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  href?: string
  to?: string
}>()
</script>

<template>
  <component
    :is="href ? 'a' : to ? 'router-link' : 'button'"
    :href="href"
    :to="to"
    :disabled="disabled"
    :class="['glow-btn', `glow-btn--${variant ?? 'primary'}`, `glow-btn--${size ?? 'md'}`]"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<style scoped>
.glow-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  border: none;
  border-radius: var(--theme-radius-md);
  font-family: var(--theme-font-mono);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: box-shadow 200ms ease, transform 120ms ease, background 200ms ease;
  letter-spacing: 0.02em;
  position: relative;
  overflow: hidden;
}

.glow-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Sizes */
.glow-btn--sm { padding: 0.3em 0.8em; font-size: var(--theme-font-size-xs); }
.glow-btn--md { padding: 0.5em 1.2em; font-size: var(--theme-font-size-sm); }
.glow-btn--lg { padding: 0.65em 1.6em; font-size: var(--theme-font-size-base); }

/* Primary — 主强调: flat bg + glow */
.glow-btn--primary {
  background: var(--theme-primary);
  color: var(--theme-background);
}
.glow-btn--primary:not(:disabled):hover {
  box-shadow: 0 0 18px 2px var(--theme-primary);
  transform: translateY(-1px);
}
.glow-btn--primary:not(:disabled):active {
  transform: translateY(0);
  box-shadow: 0 0 8px 1px var(--theme-primary);
}

/* Secondary — 次强调: tonal */
.glow-btn--secondary {
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
  border: 1px solid var(--theme-border);
}
.glow-btn--secondary:not(:disabled):hover {
  background: var(--theme-surfaceVariant);
  border-color: var(--theme-primary);
  box-shadow: 0 0 10px 1px var(--theme-primary);
}
.glow-btn--secondary:not(:disabled):active {
  background: var(--theme-scrim);
  box-shadow: none;
}

/* Ghost — 低强调: text only */
.glow-btn--ghost {
  background: transparent;
  color: var(--theme-secondary);
}
.glow-btn--ghost:not(:disabled):hover {
  color: var(--theme-primary);
  background: var(--theme-scrim);
}
</style>
