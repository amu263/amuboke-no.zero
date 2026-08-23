<script setup lang="ts">
// components/ui/GlitchText.vue — 故障艺术文字
// Usage: <GlitchText>OFFLINE</GlitchText>
defineProps<{
  active?: boolean
  tone?: 'surface' | 'primary'
}>()
</script>

<template>
  <span
    :class="['glitch-text', {
      'glitch-text--active': active ?? true,
      'glitch-text--primary': tone === 'primary'
    }]"
    :data-text="$slots.default?.()?.[0]?.children ?? ''"
  >
    <slot />
  </span>
</template>

<style scoped>
.glitch-text {
  position: relative;
  display: inline-block;
  font-family: var(--theme-font-mono);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--theme-on-surface);
}

.glitch-text--primary {
  color: var(--theme-primary);
}

/* Default active state animation */
.glitch-text--active::before,
.glitch-text--active::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  background: transparent;
}

/* Red/cyan offset clones */
.glitch-text--active::before {
  color: var(--theme-error);
  animation: glitch-red 2.5s infinite steps(1);
  clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%);
}
.glitch-text--active::after {
  color: var(--theme-primary);
  animation: glitch-cyan 2.5s infinite steps(1);
  clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
}

@keyframes glitch-red {
  0%,  100% { transform: translateX(0);    opacity: 0; }
  5%         { transform: translateX(-3px); opacity: 0.8; }
  10%        { transform: translateX(0);    opacity: 0; }
  85%        { opacity: 0; }
  86%        { transform: translateX(2px);  opacity: 0.7; }
  90%        { transform: translateX(0);    opacity: 0; }
}

@keyframes glitch-cyan {
  0%,  100% { transform: translateX(0);    opacity: 0; }
  15%        { transform: translateX(2px);  opacity: 0.6; }
  20%        { transform: translateX(0);    opacity: 0; }
  88%        { opacity: 0; }
  89%        { transform: translateX(-2px); opacity: 0.7; }
  93%        { transform: translateX(0);    opacity: 0; }
}
</style>
